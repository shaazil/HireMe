# HireMe

An AI-powered hiring intelligence platform providing automated, adaptive interviews and coding challenges.

## Getting Started

### Local Development

1. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   # Start the backend server
   uvicorn main:app --reload
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   # Start the frontend dev server
   npm run dev
   ```

### Docker & Database Migrations

**Start PostgreSQL Database**
```bash
cd backend
docker-compose up -d db
```

**Run Migrations (Alembic)**
```bash
alembic upgrade head
```

**Run Full Stack with Docker**
```bash
cd backend
docker-compose up -d
```

### Running Tests
```bash
cd backend
source venv/bin/activate
PYTHONPATH=. pytest tests/
```
