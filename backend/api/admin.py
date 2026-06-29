from datetime import datetime, timedelta
import jwt
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlmodel import Session, select
from database.db import engine, Admin
from dotenv import load_dotenv
import bcrypt
import os

load_dotenv()

key = os.getenv("SECRET_KEY")
algorithm = os.getenv("ALGORITHM")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/admin/login")

def get_db():
    with Session(engine) as session:
        yield session

router = APIRouter(prefix="/admin", tags=["admin"])

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

class UserSchema(BaseModel):
    username: str

class UserInDB(UserSchema):
    hashed_password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login", tags=["admin"], response_model=Token)
async def login_admin(login: LoginRequest, db: Session = Depends(get_db)):
    statement = select(Admin).where(Admin.username == login.username)
    results = db.exec(statement)
    user = results.first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if bcrypt.checkpw(login.password.encode('utf-8'), user.password.encode('utf-8')):
        payload = {"sub": user.username, "exp": datetime.utcnow() + timedelta(hours=2)}
        token = jwt.encode(payload, key, algorithm=algorithm)
        return Token(access_token=token, token_type="bearer")
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")


