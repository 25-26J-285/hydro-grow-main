from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
import bcrypt
import jwt

from app.core.config import settings

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/token")


# ============ Pydantic Schemas ============
class UserRegister(BaseModel):
    email: str
    password: str
    fullname: Optional[str] = None


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class TokenData(BaseModel):
    email: Optional[str] = None


# ============ In-Memory User DB (Demo) ============
# Replace with a real database (e.g. PostgreSQL) in production
def _make_user(email: str, password: str, fullname: str) -> dict:
    return {
        "email": email,
        "fullname": fullname,
        "hashed_password": bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode(),
        "is_active": True,
    }


fake_users_db: dict = {
    "farmer@example.com": _make_user("farmer@example.com", "password123", "Demo Farmer"),
}


# ============ Helper Functions ============
def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credential_exception
        token_data = TokenData(email=email)
    except jwt.InvalidTokenError:
        raise credential_exception
    user = fake_users_db.get(token_data.email)
    if user is None:
        raise credential_exception
    return user


# ============ Auth Routes ============
@router.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    if user.email in fake_users_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
    fake_users_db[user.email] = _make_user(user.email, user.password, user.fullname or "User")
    return {"message": "User registered successfully", "email": user.email}


@router.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    db_user = fake_users_db.get(user.email)
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=expires)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"email": db_user["email"], "fullname": db_user["fullname"]},
    }


@router.post("/api/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    return await login(UserLogin(email=form_data.username, password=form_data.password))


@router.get("/api/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return {
        "email": current_user["email"],
        "fullname": current_user["fullname"],
        "is_active": current_user["is_active"],
    }


@router.get("/api/items")
async def list_items(current_user: dict = Depends(get_current_user)):
    return {
        "items": [
            {"id": 1, "name": "Hydroponic Lettuce", "status": "healthy", "ph": 6.5},
            {"id": 2, "name": "Basil Plant", "status": "healthy", "ph": 6.2},
            {"id": 3, "name": "Spinach", "status": "monitoring", "ph": 6.8},
        ],
        "user": current_user["email"],
    }
