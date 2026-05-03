import os

# backend/ directory (3 levels up from this file: core -> app -> backend)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Settings:
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: list = ["*"]

    MODELS_DIR: str = os.path.join(BASE_DIR, "models")
    IMAGES_DIR: str = os.path.join(BASE_DIR, "images")

    API_PORT: int = 8000
    UDP_PORT: int = 12345

    @property
    def YOLO_MODEL_PATH(self) -> str:
        return os.path.join(self.MODELS_DIR, "best.pt")

    @property
    def GERMINATION_MODEL_PATH(self) -> str:
        return os.path.join(self.MODELS_DIR, "germination.pt")

    @property
    def RICE_MODEL_PATH(self) -> str:
        return os.path.join(self.MODELS_DIR, "best_rice_model_convNext_V3.keras")

    @property
    def ENERGY_MODEL_PATH(self) -> str:
        return os.path.join(self.MODELS_DIR, "energy_lstm_model.keras")

    @property
    def ENERGY_SCALER_PATH(self) -> str:
        return os.path.join(self.MODELS_DIR, "energy_scaler.pkl")


settings = Settings()
