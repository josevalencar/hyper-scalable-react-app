from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import insert, update
from .models import User, OTP
from passlib.context import CryptContext
from datetime import datetime, timedelta
import random, string

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(User).where(User.email == email))
    return result.scalars().first()

async def create_user(db: AsyncSession, email: str, password: str):
    hashed_password = pwd_context.hash(password)
    stmt = insert(User).values(email=email, hashed_password=hashed_password)
    await db.execute(stmt)
    await db.commit()
    return await get_user_by_email(db, email)

async def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

async def create_otp(db: AsyncSession, user_id: int, expires_minutes: int = 10):
    otp_code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=expires_minutes)
    stmt = insert(OTP).values(user_id=user_id, otp_code=otp_code, expires_at=expires_at)
    await db.execute(stmt)
    await db.commit()
    return otp_code

async def verify_otp(db: AsyncSession, email: str, otp_code: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    result = await db.execute(select(OTP).where(OTP.user_id == user.id, OTP.otp_code == otp_code, OTP.used == False, OTP.expires_at > datetime.utcnow()))
    otp = result.scalars().first()
    if otp:
        await db.execute(update(OTP).where(OTP.id == otp.id).values(used=True))
        await db.commit()
        return True
    return False

async def update_user_password(db: AsyncSession, email: str, new_password: str):
    user = await get_user_by_email(db, email)
    if not user:
        return False
    hashed_password = pwd_context.hash(new_password)
    await db.execute(update(User).where(User.id == user.id).values(hashed_password=hashed_password))
    await db.commit()
    return True 