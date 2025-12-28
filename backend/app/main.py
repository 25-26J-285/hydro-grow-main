from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import jwt
import hashlib

# Configuration
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Simple password hashing (not for production - use bcrypt in production)
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password

# JWT token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Initialize FastAPI app
app = FastAPI(
    title="Hydro Grow API",
    description="Backend for Smart Hydroponic System",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ Pydantic Models ============
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

# ============ In-Memory Database (Demo) ============
# In production, use a real database like PostgreSQL
fake_users_db = {
    "farmer@example.com": {
        "email": "farmer@example.com",
        "fullname": "Demo Farmer",
        "hashed_password": hash_password("password123"),
        "is_active": True,
    }
}

# ============ Helper Functions ============
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credential_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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

# ============ API Routes ============
@app.get("/healthz")
async def healthz():
    """Health check endpoint"""
    return {"status": "ok", "service": "Hydro Grow API"}

@app.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    """Register a new user"""
    if user.email in fake_users_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    fake_users_db[user.email] = {
        "email": user.email,
        "fullname": user.fullname or "User",
        "hashed_password": hash_password(user.password),
        "is_active": True,
    }
    
    return {
        "message": "User registered successfully",
        "email": user.email
    }

@app.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    """Login user and return JWT token"""
    db_user = fake_users_db.get(user.email)
    
    if not db_user or not verify_password(user.password, db_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": db_user["email"],
            "fullname": db_user["fullname"],
        }
    }

@app.post("/api/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Alternative login endpoint using form data"""
    user_data = UserLogin(email=form_data.username, password=form_data.password)
    return await login(user_data)

@app.get("/api/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return {
        "email": current_user["email"],
        "fullname": current_user["fullname"],
        "is_active": current_user["is_active"],
    }

@app.get("/api/items")
async def list_items(current_user: dict = Depends(get_current_user)):
    """List hydroponic items (requires authentication)"""
    return {
        "items": [
            {"id": 1, "name": "Hydroponic Lettuce", "status": "healthy", "ph": 6.5},
            {"id": 2, "name": "Basil Plant", "status": "healthy", "ph": 6.2},
            {"id": 3, "name": "Spinach", "status": "monitoring", "ph": 6.8},
        ],
        "user": current_user["email"]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
