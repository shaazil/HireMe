from database.session import SessionLocal
from models.user import User, UserRole
from models.candidate import Candidate
from models.recruiter import Recruiter

db = SessionLocal()
user = db.query(User).filter(User.email == 'shazil@gmail.com').first()
print("Role from DB:", user.role)
print("Is Recruiter:", user.role == UserRole.RECRUITER)
print("Role type:", type(user.role))
