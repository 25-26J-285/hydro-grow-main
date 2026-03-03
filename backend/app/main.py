from fastapi import FastAPI, Depends, HTTPException, status,UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import jwt
import hashlib
from app.routers import esp32_gateway
from app.api import sensors
from app.api import actuators
import threading
import numpy as np
import tensorflow as tf
import io
import os
import uuid
import keras
from app.services.discovery import run_discovery_service

IMAGES_DIR = "images"
os.makedirs(IMAGES_DIR, exist_ok=True)

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

# Start UDP Discovery Service in background
discovery_thread = threading.Thread(target=run_discovery_service, daemon=True)
discovery_thread.start()

# Include routers
app.include_router(esp32_gateway.router)
app.include_router(sensors.router)
app.include_router(actuators.router)

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

IMAGE_SIZE = (384, 384)

image_class_type_dirs = [
    'BG 360', 'AT 362', 'BW 367', 'BG 357'
    # ⚠️ add ALL rice types in the SAME order as training
]

image_class_quality_dirs = ["Bad", "Good"]    
model = tf.keras.models.load_model("D:/LEC/Research/Backend New/backend/backend/app/best_rice_model_convNext_V3.keras")
print("✅ Rice model loaded")
def preprocess_image(image_bytes):
    # image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    # image = image.resize(IMAGE_SIZE)
    # image = np.array(image).astype(np.float32)
    image = tf.io.decode_jpeg(
        image_bytes,
        channels=3
    )
    # image = tf.image.decode_image(image_bytes,channels=3, expand_animations=False)
    image_resized = tf.image.resize(image,IMAGE_SIZE)

    # ---- Preprocess for ResNet50 ----
    # model_input = tf.keras.applications.resnet50.preprocess_input(image_resized)
    model_input = tf.keras.applications.convnext.preprocess_input(image_resized)
    model_input = tf.expand_dims(model_input, axis=0)

    return model_input

@app.post("/api/predict-rice")
async def predict_rice(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image_id = str(uuid.uuid4())
    # ------------------
    # Save original image
    # ------------------
    original_path = f"{IMAGES_DIR}/{image_id}_original.jpg"
    with open(original_path, "wb") as f:
        f.write(image_bytes)

    model_input= preprocess_image(image_bytes)
    # ------------------
    # Save processed image
    # ------------------
    # processed_path = f"{IMAGES_DIR}/{image_id}_processed.jpg"
    # processed_uint8 = tf.cast(processed_image, tf.uint8)
    # encoded_img = tf.io.encode_jpeg(processed_uint8)
    # tf.io.write_file(processed_path, encoded_img)

    predictions = model.predict(model_input, verbose=0)

    type_probs = predictions["type"][0]
    quality_probs = predictions["quality"][0]

    # type_idx = int(np.argmax(type_probs))
    # quality_idx = int(np.argmax(quality_probs))
    type_idx = np.argmax(type_probs)
    quality_idx = np.argmax(quality_probs)

    return {
        "rice_type": image_class_type_dirs[type_idx],
        "rice_type_confidence": float(type_probs[type_idx]),
        "rice_quality": image_class_quality_dirs[quality_idx],
        "rice_quality_confidence": float(quality_probs[quality_idx]),
        "top_type_predictions": [
            {
                "name": image_class_type_dirs[i],
                "confidence": float(type_probs[i])
            }
            for i in np.argsort(type_probs)[::-1][:3]
        ],
        "quality_probabilities": {
            image_class_quality_dirs[i]: float(quality_probs[i])
            for i in range(len(image_class_quality_dirs))
        }
    }    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
