from extensions import db
from .user import student_skill

class Skill(db.Model):
    __tablename__ = 'skill'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    # Relationships
    students = db.relationship('User', secondary=student_skill, back_populates='skills')
    teacher = db.relationship('User', foreign_keys=[teacher_id])
    certificates = db.relationship('Certificate', back_populates='skill', cascade="all, delete-orphan")
    payments = db.relationship('Payment', back_populates='skill', cascade="all, delete-orphan")
