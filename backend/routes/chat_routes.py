from flask import Blueprint, request, jsonify
from extensions import db
from models import StudySession, ChatMessage, TeacherRequest, User
from flask_jwt_extended import get_jwt_identity
from utils.decorators import role_required

chat_bp = Blueprint('chat_bp', __name__, url_prefix='/chat')

# Student sends request for 1:1 (alternative: TeacherRequest model persisted)
@chat_bp.route('/request', methods=['POST'])
@role_required('student')
def request_1to1():
    data = request.get_json()
    current = get_jwt_identity()

    tr = TeacherRequest(
        student_id=current['id'],
        teacher_id=data['teacher_id'],
        message=data.get('message', '')
    )
    db.session.add(tr)
    db.session.commit()
    return jsonify({"message": "Request sent to teacher", "request_id": tr.id}), 201

# Teacher accepts request -> create StudySession
@chat_bp.route('/accept/<int:request_id>', methods=['POST'])
@role_required('teacher')
def accept_request(request_id):
    current = get_jwt_identity()
    req = TeacherRequest.query.get(request_id)
    if not req or req.teacher_id != current['id']:
        return jsonify({"error": "Request not found or unauthorized"}), 404

    req.status = 'accepted'
    session = StudySession(student_id=req.student_id, teacher_id=req.teacher_id, subject=req.message)
    db.session.add(session)
    db.session.commit()
    return jsonify({"message": "Session created", "session_id": session.id}), 201

# Send chat message inside a session
@chat_bp.route('/session/<int:session_id>/message', methods=['POST'])
@role_required('student', 'teacher')
def send_message(session_id):
    current = get_jwt_identity()
    data = request.get_json()
    session = StudySession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    # verify user is participant
    if current['id'] not in (session.student_id, session.teacher_id):
        return jsonify({"error": "Not a participant"}), 403

    msg = ChatMessage(session_id=session_id, sender_id=current['id'], message=data.get('message', ''))
    db.session.add(msg)
    db.session.commit()
    return jsonify({"message": "Message sent", "message_id": msg.id}), 201

# Get messages in a session
@chat_bp.route('/session/<int:session_id>/messages', methods=['GET'])
@role_required('student','teacher')
def get_messages(session_id):
    current = get_jwt_identity()
    session = StudySession.query.get(session_id)
    if not session:
        return jsonify({"error": "Session not found"}), 404
    if current['id'] not in (session.student_id, session.teacher_id):
        return jsonify({"error": "Not a participant"}), 403

    messages = ChatMessage.query.filter_by(session_id=session_id).order_by(ChatMessage.timestamp.asc()).all()
    data = [{"id": m.id, "sender_id": m.sender_id, "message": m.message, "timestamp": m.timestamp} for m in messages]
    return jsonify(data), 200
