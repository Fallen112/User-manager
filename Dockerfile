FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
EXPOSE 8080

CMD cd backend && uvicorn main:app --host 0.0.0.0 --port 8000 & \
    cd frontend && python -m http.server 8080