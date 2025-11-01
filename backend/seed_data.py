from extensions import db
from models import User, Course, Module, Skill
from app import create_app

def seed_database():
    app = create_app()
    with app.app_context():
        # Check if teacher exists
        teacher = User.query.filter_by(email="teacher@test.com").first()
        if not teacher:
            teacher = User(full_name="John Teacher", email="teacher@test.com", role="teacher")
            teacher.set_password("password")
            db.session.add(teacher)
            db.session.commit()
        
        # Check if courses exist
        if Course.query.count() == 0:
            course1 = Course(title="Python Programming", description="Learn Python from basics", price=100.0, teacher_id=teacher.id)
            course2 = Course(title="Web Development", description="Build modern web apps", price=150.0, teacher_id=teacher.id)
            db.session.add_all([course1, course2])
            db.session.commit()
            
            # Add modules
            modules = [
                Module(title="Python Basics", content="Variables and data types", course_id=course1.id),
                Module(title="Functions", content="Creating and using functions", course_id=course1.id),
                Module(title="HTML/CSS", content="Web page structure", course_id=course2.id),
                Module(title="JavaScript", content="Interactive web pages", course_id=course2.id)
            ]
            db.session.add_all(modules)
        
        # Check if skills exist
        if Skill.query.count() == 0:
            skill1 = Skill(name="Data Analysis", description="Analyze data with Python", price=80.0, teacher_id=teacher.id)
            skill2 = Skill(name="API Development", description="Build REST APIs", price=120.0, teacher_id=teacher.id)
            db.session.add_all([skill1, skill2])
        
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    seed_database()