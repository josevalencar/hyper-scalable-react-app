import os
import shutil
import urllib.request
from subprocess import call
from time import strftime
from sqlalchemy.orm import Session
from db import SessionLocal
import models
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from books.utils import get_book

# Configuration
TEMP_PATH = './catalog_temp'
URL = 'https://gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2'
DOWNLOAD_PATH = os.path.join(TEMP_PATH, 'catalog.tar.bz2')
MOVE_SOURCE_PATH = os.path.join(TEMP_PATH, 'cache/epub')
MOVE_TARGET_PATH = './catalog_files/rdf'


def get_directory_set(path):
    directory_set = set()
    for directory_item in os.listdir(path):
        item_path = os.path.join(path, directory_item)
        if os.path.isdir(item_path):
            directory_set.add(directory_item)
    return directory_set


def put_catalog_in_db():
    db: Session = SessionLocal()
    book_ids = []
    for directory_item in os.listdir(MOVE_TARGET_PATH):
        item_path = os.path.join(MOVE_TARGET_PATH, directory_item)
        if os.path.isdir(item_path):
            try:
                book_id = int(directory_item)
            except ValueError:
                continue
            else:
                book_ids.append(book_id)
    book_ids.sort()
    book_directories = [str(id) for id in book_ids]

    for directory in book_directories:
        id = int(directory)
        print(f'Processing book {id}')
        book_path = os.path.join(MOVE_TARGET_PATH, directory, f'pg{directory}.rdf')
        book = get_book(id, book_path)
        try:
            # Book
            book_in_db = db.query(models.Book).filter_by(gutenberg_id=id).first()
            if book_in_db:
                book_in_db.copyright = book['copyright']
                book_in_db.download_count = book['downloads']
                book_in_db.media_type = book['type']
                book_in_db.title = book['title']
            else:
                book_in_db = models.Book(
                    gutenberg_id=id,
                    copyright=book['copyright'],
                    download_count=book['downloads'],
                    media_type=book['type'],
                    title=book['title']
                )
                db.add(book_in_db)
                db.flush()
            # Authors
            authors = []
            for author in book['authors']:
                person = db.query(models.Person).filter_by(
                    name=author['name'],
                    birth_year=author['birth'],
                    death_year=author['death']
                ).first()
                if not person:
                    person = models.Person(
                        name=author['name'],
                        birth_year=author['birth'],
                        death_year=author['death']
                    )
                    db.add(person)
                    db.flush()
                authors.append(person)
            book_in_db.authors = authors
            # Translators
            translators = []
            for translator in book['translators']:
                person = db.query(models.Person).filter_by(
                    name=translator['name'],
                    birth_year=translator['birth'],
                    death_year=translator['death']
                ).first()
                if not person:
                    person = models.Person(
                        name=translator['name'],
                        birth_year=translator['birth'],
                        death_year=translator['death']
                    )
                    db.add(person)
                    db.flush()
                translators.append(person)
            book_in_db.translators = translators
            # Bookshelves
            bookshelves = []
            for shelf in book['bookshelves']:
                shelf_in_db = db.query(models.Bookshelf).filter_by(name=shelf).first()
                if not shelf_in_db:
                    shelf_in_db = models.Bookshelf(name=shelf)
                    db.add(shelf_in_db)
                    db.flush()
                bookshelves.append(shelf_in_db)
            book_in_db.bookshelves = bookshelves
            # Formats
            db.query(models.Format).filter_by(book_id=book_in_db.id).delete()
            for mime_type, url in book['formats'].items():
                format_in_db = models.Format(
                    book=book_in_db,
                    mime_type=mime_type,
                    url=url
                )
                db.add(format_in_db)
            # Languages
            languages = []
            for language in book['languages']:
                language_in_db = db.query(models.Language).filter_by(code=language).first()
                if not language_in_db:
                    language_in_db = models.Language(code=language)
                    db.add(language_in_db)
                    db.flush()
                languages.append(language_in_db)
            book_in_db.languages = languages
            # Subjects
            subjects = []
            for subject in book['subjects']:
                subject_in_db = db.query(models.Subject).filter_by(name=subject).first()
                if not subject_in_db:
                    subject_in_db = models.Subject(name=subject)
                    db.add(subject_in_db)
                    db.flush()
                subjects.append(subject_in_db)
            book_in_db.subjects = subjects
            # Summaries
            db.query(models.Summary).filter_by(book_id=book_in_db.id).delete()
            for summary in book['summaries']:
                summary_in_db = models.Summary(
                    book=book_in_db,
                    text=summary
                )
                db.add(summary_in_db)
            db.commit()
        except Exception as error:
            print(f'Error while putting book {id} in the database:', error)
            db.rollback()
    db.close()


def main():
    print('Making temporary directory...')
    if os.path.exists(TEMP_PATH):
        shutil.rmtree(TEMP_PATH)
    os.makedirs(TEMP_PATH)

    print('Downloading compressed catalog...')
    urllib.request.urlretrieve(URL, DOWNLOAD_PATH)

    print('Decompressing catalog...')
    with open(os.devnull, 'w') as null:
        call(['tar', 'fjvx', DOWNLOAD_PATH, '-C', TEMP_PATH], stdout=null, stderr=null)

    print('Detecting stale directories...')
    if not os.path.exists(MOVE_TARGET_PATH):
        os.makedirs(MOVE_TARGET_PATH)
    new_directory_set = get_directory_set(MOVE_SOURCE_PATH)
    old_directory_set = get_directory_set(MOVE_TARGET_PATH)
    stale_directory_set = old_directory_set - new_directory_set

    print('Removing stale directories and books...')
    for directory in stale_directory_set:
        try:
            book_id = int(directory)
        except ValueError:
            continue
        db = SessionLocal()
        db.query(models.Book).filter_by(gutenberg_id=book_id).delete()
        db.commit()
        db.close()
        path = os.path.join(MOVE_TARGET_PATH, directory)
        shutil.rmtree(path)

    print('Replacing old catalog files...')
    with open(os.devnull, 'w') as null:
        call([
            'rsync',
            '-va',
            '--delete-after',
            MOVE_SOURCE_PATH + '/',
            MOVE_TARGET_PATH
        ], stdout=null, stderr=null)

    print('Putting the catalog in the database...')
    put_catalog_in_db()

    print('Removing temporary files...')
    shutil.rmtree(TEMP_PATH)
    print('Done!')

if __name__ == '__main__':
    main() 