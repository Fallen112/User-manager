from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn

from database import SessionLocal, engine
import models
import schemas
from middleware import admin_only, editor_or_admin

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Manager API")

# CORS middleware должен быть самым первым и настроен правильно!
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://user-manager-4vdq.onrender.com",
        "http://localhost:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Добавляем middleware для обработки ошибок с CORS-заголовками
@app.middleware("http")
async def add_cors_header(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "https://user-manager-4vdq.onrender.com"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    return response


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 📌 Создать пользователя (доступно всем)
@app.post("/users/", response_model=schemas.UserResponse, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(
        (models.User.email == user.email) | (models.User.username == user.username)
    ).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email or username already registered")

    db_user = models.User(
        username=user.username,
        email=user.email,
        password=user.password,  # Добавлено поле password
        age=user.age,
        role=user.role.value  # преобразуем Enum в строку
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# 📋 Получить всех пользователей (доступно всем)
@app.get("/users/", response_model=List[schemas.UserResponse])
def read_users(
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
        db: Session = Depends(get_db)
):
    query = db.query(models.User)
    if search:
        query = query.filter(models.User.username.contains(search))
    return query.offset(skip).limit(limit).all()


# 🔍 Получить пользователя по ID (доступно всем)
@app.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ✏️ Обновить пользователя (только админ или редактор)
@app.put("/users/{user_id}", response_model=schemas.UserResponse)
@editor_or_admin
def update_user(
        user_id: int,
        user_update: schemas.UserUpdate,
        request: Request,
        db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Получаем только те поля, которые есть в запросе
        update_data = user_update.dict(exclude_unset=True)

        # Преобразуем роль из Enum в строку, если она есть
        if 'role' in update_data and update_data['role'] is not None:
            update_data['role'] = update_data['role'].value

        # Обновляем только переданные поля
        for field, value in update_data.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user
    except Exception as e:
        print(f"Ошибка при обновлении пользователя {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ❌ Удалить пользователя (только админ)
@app.delete("/users/{user_id}")
@admin_only
def delete_user(
        user_id: int,
        request: Request,
        db: Session = Depends(get_db)
):
    try:
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        db.delete(user)
        db.commit()
        return {"ok": True}
    except Exception as e:
        print(f"Ошибка при удалении пользователя {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)