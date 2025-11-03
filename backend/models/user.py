from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash

student_skill = db.Table(
    'student_skill',
    db.Column('student_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id'), primary_key=True)
)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password_hash = db.Column(db.String(200))
    role = db.Column(db.String(20), nullable=False)  

    #relationships
    taught_courses = db.relationship('Course', back_populates='teacher', cascade="all, delete-orphan")
    enrollments = db.relationship('Enrollment', back_populates='student', cascade="all, delete-orphan")
    payments = db.relationship('Payment', back_populates='student', cascade="all, delete-orphan")
    certificates = db.relationship('Certificate', back_populates='student', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='student', cascade="all, delete-orphan")
    ratings = db.relationship('Rating', back_populates='student', cascade="all, delete-orphan")

    skills = db.relationship(
        'Skill',
        secondary=student_skill,
        back_populates='students'
    )

    #password utilities
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    @property
    def name(self):
        return self.full_name