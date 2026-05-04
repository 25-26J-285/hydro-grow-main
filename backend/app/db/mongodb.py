from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings


class MongoDatabase:
    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.database: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        if self.client is not None and self.database is not None:
            return

        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.database = self.client[settings.MONGODB_DB_NAME]

        await self.database[settings.MONGODB_USERS_COLLECTION].create_index("email", unique=True)
        await self.database[settings.MONGODB_SENSOR_COLLECTION].create_index(
            [("device_type", 1), ("recorded_at", -1)]
        )

    async def disconnect(self) -> None:
        if self.client is not None:
            self.client.close()
        self.client = None
        self.database = None

    def get_database(self) -> AsyncIOMotorDatabase:
        if self.database is None:
            raise RuntimeError("MongoDB connection has not been initialized.")
        return self.database


db = MongoDatabase()


async def connect_to_mongo() -> None:
    await db.connect()


async def close_mongo_connection() -> None:
    await db.disconnect()
