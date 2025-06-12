from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession
from ..db import get_db
from .. import crud, schemas, utils

router = APIRouter()

class RegisterRequest(BaseModel):
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

@router.post("/register", response_model=schemas.UserOut)
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = await crud.create_user(db, request.email, request.password)
    return user

@router.post("/login", response_model=schemas.Token)
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if not user or not await crud.verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    access_token = utils.create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/recover-password")
async def recover_password(request: RecoverPasswordRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, request.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    otp_code = await crud.create_otp(db, user.id)
    utils.send_email(user.email, "Your OTP Code", f"Your OTP code is: {otp_code}")
    return {"msg": "OTP sent to email"}

@router.post("/verify-otp")
async def verify_otp(request: OTPVerifyRequest, db: AsyncSession = Depends(get_db)):
    valid = await crud.verify_otp(db, request.email, request.otp)
    if not valid:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    await crud.update_user_password(db, request.email, request.new_password)
    return {"msg": "Password updated successfully"} 