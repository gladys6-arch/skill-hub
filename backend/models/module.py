from extensions import db

class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    content = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))

    course = db.relationship('Course', back_populates='modules')
    completions = db.relationship('ModuleCompletion', back_populates='module', cascade="all, delete-orphan")
