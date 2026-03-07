from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    age: int = Field(..., ge=18, le=100)
    is_active: bool = True

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=50)
    email: Optional[EmailStr] = None
    age: Optional[int] = Field(None, ge=18, le=100)
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True