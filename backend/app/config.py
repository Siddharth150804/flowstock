import os
from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    DATABASE_URL: str = Field(
        default="sqlite:///./inventory.db",
        validation_alias="DATABASE_URL"
    )
    PROJECT_NAME: str = "Inventory & Order Management System"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = Field(default="development", validation_alias="ENVIRONMENT")

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore'

settings = Settings()
