from extensions import db
from datetime import datetime

class ModuleCompletion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    student = db.relationship('User', back_populates='module_completions')
    module = db.relationship('Module', back_populates='completions')
