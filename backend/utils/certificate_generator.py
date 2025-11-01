import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from datetime import datetime
from models import Certificate, Course, User
from extensions import db

def generate_certificate(student_id, course_id):
    """Generates a certificate for a completed course."""

    # Check if one already exists
    existing = Certificate.query.filter_by(student_id=student_id, course_id=course_id).first()
    if existing:
        return existing.file_path  # Don't create duplicates

    # Get student and course info
    student = User.query.get(student_id)
    course = Course.query.get(course_id)
    if not student or not course:
        return None

    # Ensure directory exists
    os.makedirs("certificates", exist_ok=True)

    # Generate file name
    file_name = f"certificates/{student.full_name.replace(' ', '_')}_{course.title.replace(' ', '_')}.pdf"

    # Create PDF
    c = canvas.Canvas(file_name, pagesize=A4)
    width, height = A4

    # Add content
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 200, "Certificate of Completion")

    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 260, f"This certifies that")
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 290, student.full_name)

    c.setFont("Helvetica", 16)
    c.drawCentredString(width / 2, height - 330, f"has successfully completed the course")
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(width / 2, height - 360, f"{course.title}")

    c.setFont("Helvetica", 12)
    c.drawCentredString(width / 2, height - 400, f"Date: {datetime.now().strftime('%B %d, %Y')}")

    c.line(150, height - 420, width - 150, height - 420)
    c.setFont("Helvetica-Oblique", 12)
    c.drawCentredString(width / 2, height - 440, "SkillHub Platform")

    c.save()

    # Save record in DB
    cert = Certificate(student_id=student_id, course_id=course_id, file_path=file_name)
    db.session.add(cert)
    db.session.commit()

    return file_name
