from extensions import db

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    date_enrolled = db.Column(db.DateTime, default=db.func.now())
    progress = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)

    student = db.relationship('User', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')
