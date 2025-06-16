from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Table, Text
from sqlalchemy.orm import relationship
from db import Base

# Association tables for many-to-many relationships
book_author = Table(
    'book_author', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('person_id', Integer, ForeignKey('persons.id'))
)

book_translator = Table(
    'book_translator', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('person_id', Integer, ForeignKey('persons.id'))
)

book_bookshelf = Table(
    'book_bookshelf', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('bookshelf_id', Integer, ForeignKey('bookshelves.id'))
)

book_language = Table(
    'book_language', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('language_id', Integer, ForeignKey('languages.id'))
)

book_subject = Table(
    'book_subject', Base.metadata,
    Column('book_id', Integer, ForeignKey('books.id')),
    Column('subject_id', Integer, ForeignKey('subjects.id'))
)

class Book(Base):
    __tablename__ = 'books'
    id = Column(Integer, primary_key=True, index=True)
    gutenberg_id = Column(Integer, unique=True, index=True, nullable=False)
    title = Column(String(1024), nullable=True)
    copyright = Column(Boolean, nullable=True)
    download_count = Column(Integer, nullable=True)
    media_type = Column(String(16), nullable=False)

    authors = relationship('Person', secondary=book_author, back_populates='books_authored')
    translators = relationship('Person', secondary=book_translator, back_populates='books_translated')
    bookshelves = relationship('Bookshelf', secondary=book_bookshelf, back_populates='books')
    languages = relationship('Language', secondary=book_language, back_populates='books')
    subjects = relationship('Subject', secondary=book_subject, back_populates='books')
    formats = relationship('Format', back_populates='book')
    summaries = relationship('Summary', back_populates='book')

class Bookshelf(Base):
    __tablename__ = 'bookshelves'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(64), unique=True, nullable=False)
    books = relationship('Book', secondary=book_bookshelf, back_populates='bookshelves')

class Format(Base):
    __tablename__ = 'formats'
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey('books.id'))
    mime_type = Column(String(32), nullable=False)
    url = Column(String(256), nullable=False)
    book = relationship('Book', back_populates='formats')

class Language(Base):
    __tablename__ = 'languages'
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(4), unique=True, nullable=False)
    books = relationship('Book', secondary=book_language, back_populates='languages')

class Person(Base):
    __tablename__ = 'persons'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    birth_year = Column(Integer, nullable=True)
    death_year = Column(Integer, nullable=True)
    books_authored = relationship('Book', secondary=book_author, back_populates='authors')
    books_translated = relationship('Book', secondary=book_translator, back_populates='translators')

class Subject(Base):
    __tablename__ = 'subjects'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(256), nullable=False)
    books = relationship('Book', secondary=book_subject, back_populates='subjects')

class Summary(Base):
    __tablename__ = 'summaries'
    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey('books.id'))
    text = Column(Text, nullable=False)
    book = relationship('Book', back_populates='summaries') 