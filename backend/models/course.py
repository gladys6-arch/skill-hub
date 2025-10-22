from extensions import db

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    modules = db.relationship('Module', backref='course', lazy=True)