from app import create_app
from extensions import db
from models import User, Course, Module, Skill, Enrollment

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create Admin
        admin = User(
            full_name="Admin User",
            email="admin@skillhub.com",
            role="admin"
        )
        admin.set_password("admin123")
        
        # Create Teachers
        teacher1 = User(
            full_name="John Teacher",
            email="teacher@skillhub.com",
            role="teacher"
        )
        teacher1.set_password("teacher123")
        
        teacher2 = User(
            full_name="Jane Instructor",
            email="jane@skillhub.com",
            role="teacher"
        )
        teacher2.set_password("jane123")
        
        # Create Students
        student1 = User(
            full_name="Alice Student",
            email="student@skillhub.com",
            role="student"
        )
        student1.set_password("student123")
        
        student2 = User(
            full_name="Bob Learner",
            email="bob@skillhub.com",
            role="student"
        )
        student2.set_password("bob123")
        
        # Add users to database
        db.session.add_all([admin, teacher1, teacher2, student1, student2])
        db.session.commit()
        
        
