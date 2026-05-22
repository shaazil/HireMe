import sqlite3
import sys

conn = sqlite3.connect('hireme_dev.db')
c = conn.cursor()
c.execute("SELECT email, role FROM users;")
rows = c.fetchall()
print("Users in DB:", rows)

c.execute("SELECT id, recruiter_id FROM vacancies;")
vacs = c.fetchall()
print("Vacancies:", vacs)

c.execute("SELECT id, vacancy_id, candidate_id, status FROM interview_sessions;")
sessions = c.fetchall()
print("Sessions:", sessions)
