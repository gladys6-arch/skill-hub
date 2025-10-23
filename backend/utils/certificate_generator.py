import canvas
from reportlab.lib.pagesizes import letter
import io
from datetime import datetime

def generate_certificate(student_name, course_title):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)

    p.drawString(100, 750, "SkillHub Certificate of Completion")
    p.drawString(100, 700, f"This certifies that {student_name}")
    p.drawString(100, 650, f"has successfully completed the course:")
    p.drawString(100, 600, course_title)
    p.drawString(100, 550, f"Date: {datetime.now().strftime('%B %d, %Y')}")

    p.showPage()
    p.save()

    buffer.seek(0)
    return buffer
