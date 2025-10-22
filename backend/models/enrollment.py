from extensions import db

class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    enrolled_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    progress = db.Column(db.Float, default=0.0)
    completed = db.Column(db.Boolean, default=False)