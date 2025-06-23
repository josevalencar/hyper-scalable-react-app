from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from .. import crud, schemas, utils
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
import os

router = APIRouter()

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RecoverPasswordRequest(BaseModel):
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=schemas.UserOut)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(db, request.name, request.email, request.password)
    return user

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, form_data.username)
    if not user or not await crud.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = utils.create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/recover-password")
async def recover_password(request: RecoverPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp_code = await crud.create_otp(db, user.id)
    utils.send_email(user.email, "Your Insiread Code", f"Your OTP code is: {otp_code}", otp_code=otp_code)
    return {"msg": "OTP sent to email"}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    valid = await crud.verify_otp(db, request.email, request.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    await crud.update_user_password(db, request.email, request.new_password)
    return {"msg": "Password updated successfully"}

async def get_current_user(db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await crud.get_user_by_id(db, int(user_id))
    if user is None:
        raise credentials_exception
    return user

@router.get("/profile", response_model=schemas.UserOut)
async def get_profile(current_user=Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=schemas.UserOut)
async def update_profile(update: schemas.UserUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    # Only allow updating own profile
    updated = await crud.update_user_profile(db, current_user.id, update.name, update.email)
    return updated 