from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, not_
from typing import List, Optional
from models import Book, Person, Bookshelf, Language, Subject, Format

def get_books(
    db: Session,
    sort: Optional[str] = None,
    author_year_end: Optional[int] = None,
    author_year_start: Optional[int] = None,
    copyright: Optional[str] = None,
    ids: Optional[str] = None,
    languages: Optional[str] = None,
    mime_type: Optional[str] = None,
    search: Optional[str] = None,
    topic: Optional[str] = None,
) -> List[Book]:
    # Start with base query: exclude books with null download_count or null title
    query = db.query(Book).filter(Book.download_count != None, Book.title != None)

    # Sorting
    if sort == 'ascending':
        query = query.order_by(Book.id.asc())
    elif sort == 'descending':
        query = query.order_by(Book.id.desc())
    else:
        query = query.order_by(Book.download_count.desc())

    # Author year end
    if author_year_end is not None:
        query = query.join(Book.authors).filter(
            or_(Person.birth_year <= author_year_end, Person.death_year <= author_year_end)
        )

    # Author year start
    if author_year_start is not None:
        query = query.join(Book.authors).filter(
            or_(Person.birth_year >= author_year_start, Person.death_year >= author_year_start)
        )

    # Copyright filter (exclude values not in the set)
    if copyright is not None:
        copyright_strings = copyright.split(',')
        copyright_values = set()
        for copyright_string in copyright_strings:
            if copyright_string == 'true':
                copyright_values.add(True)
            elif copyright_string == 'false':
                copyright_values.add(False)
            elif copyright_string == 'null':
                copyright_values.add(None)
        for value in [True, False, None]:
            if value not in copyright_values:
                query = query.filter(Book.copyright != value)

    # IDs filter
    if ids is not None:
        try:
            id_list = [int(i) for i in ids.split(',')]
            query = query.filter(Book.gutenberg_id.in_(id_list))
        except ValueError:
            pass

    # Languages filter
    if languages is not None:
        language_codes = [code.lower() for code in languages.split(',')]
        query = query.join(Book.languages).filter(Language.code.in_(language_codes))

    # Mime type filter
    if mime_type is not None:
        query = query.join(Book.formats).filter(Format.mime_type.startswith(mime_type))

    # Search filter (authors' name or title)
    if search is not None:
        search_terms = search.split(' ')
        for term in search_terms[:32]:
            query = query.join(Book.authors).filter(
                or_(Person.name.ilike(f"%{term}%"), Book.title.ilike(f"%{term}%"))
            )

    # Topic filter (bookshelves' name or subjects' name)
    if topic is not None:
        query = query.outerjoin(Book.bookshelves).outerjoin(Book.subjects).filter(
            or_(Bookshelf.name.ilike(f"%{topic}%"), Subject.name.ilike(f"%{topic}%"))
        )

    return query.distinct().all()

def get_book_by_gutenberg_id(db: Session, gutenberg_id: int) -> Optional[Book]:
    return db.query(Book).filter(Book.gutenberg_id == gutenberg_id).first() 