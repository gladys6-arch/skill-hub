from extensions import db
from datetime import datetime

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    plan_type = db.Column(db.String(50), nullable=False)  # e.g., 'Basic', 'Premium'
    status = db.Column(db.String(20), nullable=False, default='active')  # 'active', 'inactive', 'expired'
    renewal_date = db.Column(db.DateTime, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship back to User
    teacher = db.relationship('User', backref='subscription')