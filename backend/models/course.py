from extensions import db
from .user import student_skill



class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    # Relationships
    teacher = db.relationship('User', back_populates='taught_courses')
    modules = db.relationship('Module', back_populates='course', cascade="all, delete-orphan")
    enrollments = db.relationship('Enrollment', back_populates='course', cascade="all, delete-orphan")
    payments = db.relationship('Payment', back_populates='course', cascade="all, delete-orphan")
    certificates = db.relationship('Certificate', back_populates='course', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='course', cascade="all, delete-orphan")
    ratings = db.relationship('Rating', back_populates='course', cascade="all, delete-orphan")

class Skill(db.Model):
    __tablename__='skill'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    students = db.relationship('User', secondary=student_skill, back_populates='skills')
    teacher = db.relationship('User', foreign_keys=[teacher_id])



class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    content = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))

    #relationship
    course = db.relationship('Course', back_populates='modules')


class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    date_enrolled = db.Column(db.DateTime,  default=db.func.now())
    progress = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)

    #relationships
    student = db.relationship('User', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')



