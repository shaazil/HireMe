import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

from main import app
from database.session import get_db
from models.base import Base
from models.user import User

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_register():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "testuser@example.com",
            "password": "testpassword123",
            "role": "candidate",
            "name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "testuser@example.com"
    assert data["role"] == "candidate"
    assert data["name"] == "Test User"
    assert "id" in data


def test_login():
    # Register first
    client.post(
        "/api/v1/auth/register",
        json={
            "email": "loginuser@example.com",
            "password": "loginpassword123",
            "role": "recruiter",
            "name": "Login User",
            "company": "Test Corp"
        }
    )
    
    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": "loginuser@example.com",
            "password": "loginpassword123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "loginuser@example.com"
    assert "hireme_token" in response.cookies
