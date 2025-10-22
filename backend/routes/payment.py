from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import Student
from models.payment import Transaction
from extensions import db

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/mpesa', methods=['POST'])
@jwt_required()
def mpesa_payment():
    user_id = get_jwt_identity()
    student = Student.query.get(user_id)
    
    if not student:
        return jsonify({'message': 'Access denied'}), 403
    
    data = request.get_json()
    transaction = Transaction(
        student_id=student.id,
        amount=data['amount'],
        transaction_type='payment',
        status='pending'
    )
    
    db.session.add(transaction)
    db.session.commit()
    
    # Mpesa integration logic would go here
    
    return jsonify({'message': 'Payment initiated', 'transaction_id': transaction.id})

@payment_bp.route('/callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    # Handle Mpesa callback
    return jsonify({'message': 'Callback received'})