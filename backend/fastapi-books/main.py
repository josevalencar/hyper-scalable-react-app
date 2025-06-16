from fastapi import FastAPI

from routers import books

app = FastAPI(title="Gutendex FastAPI")

app.include_router(books.router, prefix="/books", tags=["books"]) 