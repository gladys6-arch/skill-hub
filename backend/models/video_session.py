from extensions import db
from datetime import datetime

class VideoSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    study_session_id = db.Column(db.Integer, db.ForeignKey('study_session.id'))
    video_url = db.Column(db.String(500))
    is_active = db.Column(db.Boolean, default=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    ended_at = db.Column(db.DateTime)
    
    study_session = db.relationship('StudySession', backref='video_sessions')