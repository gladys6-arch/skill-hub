from flask import Blueprint, request, jsonify, send_file
from extensions import db
from models import User, Skill, Course, Enrollment, Payment, Certificate, Review, Rating, TeacherRequest
from utils.progress_tracker import complete_module
from utils.certificate_generator import generate_certificate

student_bp = Blueprint('student_bp', __name__)

# ------------------------------------------------------------
# ✅ Enroll in a Course or Skill
# ------------------------------------------------------------
@student_bp.route('/enroll', methods=['POST'])
def enroll_in_course_or_skill():
    data = request.get_json()
    student_id = data.get('student_id')
    course_id = data.get('course_id')
    skill_id = data.get('skill_id')

    if not student_id or (not course_id and not skill_id):
        return jsonify({"error": "student_id and either course_id or skill_id are required"}), 400

    if course_id:
        existing = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
        if existing:
            return jsonify({"message": "Already enrolled in this course"}), 200
        enrollment = Enrollment(student_id=student_id, course_id=course_id)
    else:
        student = User.query.get(student_id)
        skill = Skill.query.get(skill_id)
        if not student or not skill:
            return jsonify({"error": "Invalid student or skill"}), 404
        if skill in student.skills:
            return jsonify({"message": "Already enrolled in this skill"}), 200
        student.skills.append(skill)
        enrollment = None

    db.session.add(enrollment) if enrollment else db.session.commit()
    db.session.commit()
    return jsonify({"message": "Enrollment successful"}), 201


# ------------------------------------------------------------
# ✅ Mark Module Complete + Auto Certificate Generation
# ------------------------------------------------------------
@student_bp.route('/complete_module', methods=['POST'])
def mark_module_complete():
    data = request.get_json()
    student_id = data.get('student_id')
    module_id = data.get('module_id')

    if not student_id or not module_id:
        return jsonify({"error": "Missing student_id or module_id"}), 400

    response, status = complete_module(student_id, module_id)
    return jsonify(response), status


# ------------------------------------------------------------
# ✅ View Student Progress
# ------------------------------------------------------------
@student_bp.route('/progress/<int:student_id>/<int:course_id>', methods=['GET'])
def get_student_progress(student_id, course_id):
    enrollment = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not enrollment:
        return jsonify({"error": "No enrollment found for this course"}), 404
    return jsonify({
        "student_id": student_id,
        "course_id": course_id,
        "progress": enrollment.progress,
        "completed": enrollment.completed
    })


# ------------------------------------------------------------
# ✅ Download Certificate
# ------------------------------------------------------------
@student_bp.route('/download_certificate/<int:student_id>/<int:course_id>', methods=['GET'])
def download_certificate(student_id, course_id):
    certificate = Certificate.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not certificate:
        return jsonify({"error": "Certificate not found"}), 404
    return send_file(certificate.file_path, as_attachment=True)


# ------------------------------------------------------------
# ✅ Submit Review
# ------------------------------------------------------------
@student_bp.route('/review', methods=['POST'])
def add_review():
    data = request.get_json()
    student_id = data.get('student_id')
    course_id = data.get('course_id')
    comment = data.get('comment')

    if not student_id or not course_id or not comment:
        return jsonify({"error": "Missing required fields"}), 400

    review = Review(student_id=student_id, course_id=course_id, comment=comment)
    db.session.add(review)
    db.session.commit()
    return jsonify({"message": "Review added successfully"}), 201


# ------------------------------------------------------------
# ✅ Rate Course
# ------------------------------------------------------------
@student_bp.route('/rate', methods=['POST'])
def rate_course():
    data = request.get_json()
    student_id = data.get('student_id')
    course_id = data.get('course_id')
    score = data.get('score')

    if not student_id or not course_id or score is None:
        return jsonify({"error": "Missing required fields"}), 400

    existing_rating = Rating.query.filter_by(student_id=student_id, course_id=course_id).first()
    if existing_rating:
        existing_rating.score = score  # Update if exists
    else:
        rating = Rating(student_id=student_id, course_id=course_id, score=score)
        db.session.add(rating)
    db.session.commit()
    return jsonify({"message": "Rating submitted successfully"}), 201


# ------------------------------------------------------------
# ✅ Request 1:1 Session with Teacher
# ------------------------------------------------------------
@student_bp.route('/request_session', methods=['POST'])
def request_session():
    data = request.get_json()
    student_id = data.get('student_id')
    teacher_id = data.get('teacher_id')
    message = data.get('message')

    if not student_id or not teacher_id or not message:
        return jsonify({"error": "Missing required fields"}), 400

    request_exists = TeacherRequest.query.filter_by(student_id=student_id, teacher_id=teacher_id, status='pending').first()
    if request_exists:
        return jsonify({"message": "You already have a pending request with this teacher"}), 200

    new_request = TeacherRequest(student_id=student_id, teacher_id=teacher_id, message=message)
    db.session.add(new_request)
    db.session.commit()
    return jsonify({"message": "Request sent successfully"}), 201


# ------------------------------------------------------------
# ✅ View All My Requests (Chats)
# ------------------------------------------------------------
@student_bp.route('/requests/<int:student_id>', methods=['GET'])
def view_requests(student_id):
    requests = TeacherRequest.query.filter_by(student_id=student_id).all()
    return jsonify([
        {
            "id": r.id,
            "teacher_id": r.teacher_id,
            "message": r.message,
            "status": r.status,
            "date_created": r.date_created
        } for r in requests
    ])


# ------------------------------------------------------------
# ✅ View My Enrolled Courses
# ------------------------------------------------------------
@student_bp.route('/my_courses/<int:student_id>', methods=['GET'])
def get_my_courses(student_id):
    enrollments = Enrollment.query.filter_by(student_id=student_id).all()
    courses = [{
        "course_id": e.course.id,
        "title": e.course.title,
        "progress": e.progress,
        "completed": e.completed
    } for e in enrollments]
    return jsonify(courses)


# ------------------------------------------------------------
# ✅ View Payment History
# ------------------------------------------------------------
@student_bp.route('/payments/<int:student_id>', methods=['GET'])
def view_payments(student_id):
    payments = Payment.query.filter_by(student_id=student_id).all()
    return jsonify([
        {
            "id": p.id,
            "amount": p.amount,
            "status": p.status,
            "payment_type": p.payment_type,
            "teacher_share": p.teacher_share,
            "admin_share": p.admin_share,
            "date": p.course.title if p.course else None
        } for p in payments
    ])



@student_bp.route('/download_certificate/<int:student_id>/<int:course_id>', methods=['GET'])
def download_certificate(student_id, course_id):
    from flask import send_file
    from models import Certificate

    certificate = Certificate.query.filter_by(student_id=student_id, course_id=course_id).first()
    if not certificate:
        return jsonify({"error": "Certificate not found"}), 404

    return send_file(certificate.file_path, as_attachment=True)
