from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Payment
from extensions import db
from utils.decorators import role_required

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/process', methods=['POST'])
@jwt_required()
@role_required('student')
def process_payment():
    data = request.get_json()
    student_id = get_jwt_identity()
    
    payment = Payment(
        student_id=student_id,
        course_id=data['course_id'],
        amount=data['amount'],
        teacher_share=data['amount'] * 0.8,
        admin_share=data['amount'] * 0.2
    )
    
    db.session.add(payment)
    db.session.commit()
    
    return jsonify({'message': 'Payment processed'}), 201

@payment_bp.route('/history', methods=['GET'])
@jwt_required()
def payment_history():
    student_id = get_jwt_identity()
    payments = Payment.query.filter_by(student_id=student_id).all()
    
    return jsonify([{
        'id': p.id,
        'amount': p.amount,
        'status': p.status
    } for p in payments])