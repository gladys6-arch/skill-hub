from extensions import db

class TeacherRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    message = db.Column(db.Text)
    status = db.Column(db.String(20), default='pending')
    response_message = db.Column(db.Text)
    date_created = db.Column(db.DateTime, default=db.func.now())
    date_responded = db.Column(db.DateTime)
    
    student = db.relationship('User', foreign_keys=[student_id])
    teacher = db.relationship('User', foreign_keys=[teacher_id])