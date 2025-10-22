import re
from datetime import datetime

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_currency(amount):
    return f"KSH {amount:,.2f}"

def calculate_course_rating(reviews):
    if not reviews:
        return 0
    return sum(review.rating for review in reviews) / len(reviews)