from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class PersonOut(BaseModel):
    name: str
    birth_year: Optional[int] = None
    death_year: Optional[int] = None

    class Config:
        orm_mode = True

class BookshelfOut(BaseModel):
    name: str
    class Config:
        orm_mode = True

class LanguageOut(BaseModel):
    code: str
    class Config:
        orm_mode = True

class SubjectOut(BaseModel):
    name: str
    class Config:
        orm_mode = True

class SummaryOut(BaseModel):
    text: str
    class Config:
        orm_mode = True

class FormatOut(BaseModel):
    mime_type: str
    url: str
    class Config:
        orm_mode = True

class BookOut(BaseModel):
    id: int
    title: Optional[str]
    authors: List[PersonOut]
    summaries: List[str]
    translators: List[PersonOut]
    subjects: List[str]
    bookshelves: List[str]
    languages: List[str]
    copyright: Optional[bool]
    media_type: str
    formats: Dict[str, str]
    download_count: Optional[int]

    class Config:
        orm_mode = True 