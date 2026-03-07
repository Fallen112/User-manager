from sqlalchemy import Column, Integer, String, Boolean, DateTime
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)  # пока может быть пустым
    avatar_url = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    role = Column(String, default="user")  # новая строка: "user", "admin", "editor"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)