from extensions import db

class Certificate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=True)
    file_path = db.Column(db.String(200))

    student = db.relationship('User', back_populates='certificates')
    course = db.relationship('Course', back_populates='certificates')
    skill = db.relationship('Skill', back_populates='certificates')