import re
from datetime import datetime

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def format_currency(amount):
    return f"KSH {amount:,.2f}"

def calculate_progress(completed_modules, total_modules):
    if total_modules == 0:
        return 0
    return (completed_modules / total_modules) * 100