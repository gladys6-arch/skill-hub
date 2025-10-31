from app import create_app
from extensions import db
from models import User, Course, Module, Skill, Enrollment

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create Admins
        admin1 = User(
            full_name="John Admin",
            email="jobk@gmail.com",
            role="admin"
        )
        admin1.set_password("admin123")
        
        admin2 = User(
            full_name="Beverly Admin",
            email="beverly@gmail.com",
            role="admin"
        )
        admin2.set_password("admin254")
        
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
        db.session.add_all([admin1, admin2, teacher1, teacher2, student1, student2])
        db.session.commit()
        
        # Create Skills
        skills = [
            Skill(name="Python"),
            Skill(name="JavaScript"),
            Skill(name="React"),
            Skill(name="Flask")
        ]
        db.session.add_all(skills)
        db.session.commit()
        
        # Create Courses
        course1 = Course(
            title="Python for Beginners",
            description="Learn Python programming from scratch",
            price=99.99,
            teacher_id=teacher1.id
        )
        
        course2 = Course(
            title="React Development",
           description="Build modern web apps with React",
            price=149.99,
            teacher_id=teacher2.id )
        
        course3 = Course(
            title="Flask API Development",
            description="Create REST APIs with Flask",
            price=129.99,
            teacher_id=teacher1.id
        )
        
        db.session.add_all([course1, course2, course3])
        db.session.commit()

         # Create Modules
        modules = [
            Module(title="Introduction to Python", content="Basic Python concepts", course_id=course1.id),
            Module(title="Variables and Data Types", content="Python data types", course_id=course1.id),
            Module(title="React Basics", content="Introduction to React", course_id=course2.id),
            Module(title="Components", content="React components", course_id=course2.id),
            Module(title="Flask Setup", content="Setting up Flask", course_id=course3.id)
        ]
        db.session.add_all(modules)

        # Create Enrollments
        enrollments = [
            Enrollment(student_id=student1.id, course_id=course1.id, progress=50),
            Enrollment(student_id=student1.id, course_id=course2.id, progress=25),
            Enrollment(student_id=student2.id, course_id=course1.id, progress=100, completed=True),
            Enrollment(student_id=student2.id, course_id=course3.id, progress=75)
        ]
        db.session.add_all(enrollments)
        
        db.session.commit()
        print("✅ Database seeded successfully!")
        print("\n📋 Test Accounts:")
        print("Admin 1: jobk@gmail.com / admin123")
        print("Admin 2: beverly@gmail.com / admin254")
        print("Teacher: teacher@skillhub.com / teacher123")
        print("Student: student@skillhub.com / student123")

if __name__ == '__main__':
    seed_data()
        
