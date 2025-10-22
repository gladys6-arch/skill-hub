from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

def generate_certificate(student_name, course_title):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Certificate content
    p.drawString(100, 750, "Certificate of Completion")
    p.drawString(100, 700, f"This certifies that {student_name}")
    p.drawString(100, 650, f"has successfully completed the course:")
    p.drawString(100, 600, course_title)
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return buffer