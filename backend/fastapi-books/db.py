from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Example PostgreSQL URL: 'postgresql://user:password@localhost/dbname'
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://josevalencar:<your_password>@localhost:5432/gutendex")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 