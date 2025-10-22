from extensions import db

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('student.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    transaction_type = db.Column(db.String(20), nullable=False)  # payment, refund
    status = db.Column(db.String(20), default='pending')
    mpesa_receipt = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())