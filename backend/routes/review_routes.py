from flask import Blueprint, request, jsonify
from extensions import db
from models import Review, Rating, Course
from utils.decorators import role_required
from flask_jwt_extended import get_jwt_identity

review_bp = Blueprint('review_bp', __name__, url_prefix='/reviews')

@review_bp.route('/course/<int:course_id>', methods=['POST'])
@role_required('student')
def add_review(course_id):
    user = get_jwt_identity()
    course = Course.query.get(course_id)
    if not course:
        return jsonify({"error":"Course not found"}), 404
    data = request.get_json()
    comment = data.get('comment', '')
    score = int(data.get('score', 5))
    rating = Rating(student_id=user['id'], course_id=course_id, score=score)
    review = Review(student_id=user['id'], course_id=course_id, comment=comment)
    db.session.add(rating)
    db.session.add(review)
    db.session.commit()
    return jsonify({"message":"Review and rating saved"}), 201

@review_bp.route('/course/<int:course_id>', methods=['GET'])
def list_reviews(course_id):
    reviews = Review.query.filter_by(course_id=course_id).all()
    data = [{"id": r.id, "student_id": r.student_id, "comment": r.comment, "date": r.date_created} for r in reviews]
    return jsonify(data), 200
