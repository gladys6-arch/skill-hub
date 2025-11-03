from extensions import db
from models import User
from app import create_app

def create_student():
    app = create_app()
    with app.app_context():
        # Check if student exists
        student = User.query.filter_by(email="student@test.com").first()
        if not student:
            student = User(full_name="Test Student", email="student@test.com", role="student")
            student.set_password("password")
            db.session.add(student)
            db.session.commit()
            print("Student created: student@test.com / password")
        else:
            print("Student already exists")

if __name__ == "__main__":
    create_student()