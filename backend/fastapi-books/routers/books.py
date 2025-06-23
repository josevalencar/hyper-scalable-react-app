from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from db import get_db
from schemas import BookOut
from services.books import get_books, get_book_by_gutenberg_id

router = APIRouter()

@router.get("/", response_model=dict)
def list_books(
    sort: Optional[str] = Query(None),
    author_year_end: Optional[int] = Query(None),
    author_year_start: Optional[int] = Query(None),
    copyright: Optional[str] = Query(None),
    ids: Optional[str] = Query(None),
    languages: Optional[str] = Query(None),
    mime_type: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    total = get_books(
        db=db,
        sort=sort,
        author_year_end=author_year_end,
        author_year_start=author_year_start,
        copyright=copyright,
        ids=ids,
        languages=languages,
        mime_type=mime_type,
        search=search,
        topic=topic,
        count_only=True
    )
    books = get_books(
        db=db,
        sort=sort,
        author_year_end=author_year_end,
        author_year_start=author_year_start,
        copyright=copyright,
        ids=ids,
        languages=languages,
        mime_type=mime_type,
        search=search,
        topic=topic,
        limit=limit,
        offset=offset
    )
    base_url = str(router.prefix or "")
    next_offset = offset + limit if offset + limit < total else None
    prev_offset = offset - limit if offset - limit >= 0 else None
    next_url = f"{base_url}/?limit={limit}&offset={next_offset}" if next_offset is not None else None
    prev_url = f"{base_url}/?limit={limit}&offset={prev_offset}" if prev_offset is not None else None
    return {
        "count": total,
        "next": next_url,
        "previous": prev_url,
        "results": [
            {
                "id": book.id,
                "title": book.title,
                "authors": [{"name": a.name, "birth_year": a.birth_year, "death_year": a.death_year} for a in book.authors],
                "summaries": [s.text for s in book.summaries],
                "translators": [{"name": t.name, "birth_year": t.birth_year, "death_year": t.death_year} for t in book.translators],
                "subjects": [s.name for s in book.subjects],
                "bookshelves": [b.name for b in book.bookshelves],
                "languages": [l.code for l in book.languages],
                "copyright": book.copyright,
                "media_type": book.media_type,
                "formats": {f.mime_type: f.url for f in book.formats},
                "download_count": book.download_count,
            }
            for book in books
        ]
    }

@router.get("/{gutenberg_id}", response_model=BookOut)
def get_book(gutenberg_id: int, db: Session = Depends(get_db)):
    book = get_book_by_gutenberg_id(db, gutenberg_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return {
        "id": book.id,
        "title": book.title,
        "authors": [{"name": a.name, "birth_year": a.birth_year, "death_year": a.death_year} for a in book.authors],
        "summaries": [s.text for s in book.summaries],
        "translators": [{"name": t.name, "birth_year": t.birth_year, "death_year": t.death_year} for t in book.translators],
        "subjects": [s.name for s in book.subjects],
        "bookshelves": [b.name for b in book.bookshelves],
        "languages": [l.code for l in book.languages],
        "copyright": book.copyright,
        "media_type": book.media_type,
        "formats": {f.mime_type: f.url for f in book.formats},
        "download_count": book.download_count,
    } 