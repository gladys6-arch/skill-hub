from extensions import db

class Rating(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date_created = db.Column(db.DateTime, default=db.func.now())

    student = db.relationship('User', back_populates='ratings')
    course = db.relationship('Course', back_populates='ratings')
