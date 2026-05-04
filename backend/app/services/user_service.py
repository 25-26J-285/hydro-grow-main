from datetime import datetime, timezone

import bcrypt

from app.core.config import settings
from app.db.mongodb import db


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def serialize_user(user_doc: dict) -> dict:
    return {
        "id": str(user_doc["_id"]),
        "email": user_doc["email"],
        "fullname": user_doc.get("fullname", "User"),
        "is_active": user_doc.get("is_active", True),
        "created_at": user_doc.get("created_at"),
    }


async def get_user_by_email(email: str) -> dict | None:
    normalized_email = email.strip().lower()
    collection = db.get_database()[settings.MONGODB_USERS_COLLECTION]
    return await collection.find_one({"email": normalized_email})


async def create_user(email: str, password: str, fullname: str | None = None) -> dict:
    normalized_email = email.strip().lower()
    user_doc = {
        "email": normalized_email,
        "fullname": (fullname or "User").strip(),
        "hashed_password": hash_password(password),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    collection = db.get_database()[settings.MONGODB_USERS_COLLECTION]
    result = await collection.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return user_doc
