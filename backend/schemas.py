from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum

# Перечисление возможных ролей
class UserRole(str, Enum):
    user = "user"
    editor = "editor"
    admin = "admin"

class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    age: int = Field(None, ge=18, le=100)
    role: UserRole = UserRole.user  # добавляем поле с дефолтным значением

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=18, le=100)
    role: Optional[UserRole] = None  # роль можно не обновлять
    is_active: Optional[bool] = None

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    age: Optional[int]
    role: UserRole  # обязательно показываем роль
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True