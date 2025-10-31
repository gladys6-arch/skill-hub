from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
import io
from datetime import datetime
import os

def generate_certificate(student_name, course_title, cert_type="course"):
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Certificate background
    p.setFillColor(HexColor('#f8f9fa'))
    p.rect(50, 50, width-100, height-100, fill=1, stroke=0)
    
    # Title
    p.setFillColor(HexColor('#2c3e50'))
    p.setFont("Helvetica-Bold", 24)
    p.drawCentredText(width/2, height-150, "SkillHub Certificate of Completion")
    
    # Content
    p.setFont("Helvetica", 16)
    p.drawCentredText(width/2, height-220, "This certifies that")
    
    p.setFont("Helvetica-Bold", 20)
    p.setFillColor(HexColor('#3498db'))
    p.drawCentredText(width/2, height-260, student_name)
    
    p.setFillColor(HexColor('#2c3e50'))
    p.setFont("Helvetica", 16)
    completion_text = f"has successfully completed the {cert_type}:"
    p.drawCentredText(width/2, height-300, completion_text)
    
    p.setFont("Helvetica-Bold", 18)
    p.setFillColor(HexColor('#27ae60'))
    p.drawCentredText(width/2, height-340, course_title)
    
    # Date
    p.setFillColor(HexColor('#2c3e50'))
    p.setFont("Helvetica", 14)
    p.drawCentredText(width/2, height-400, f"Date: {datetime.now().strftime('%B %d, %Y')}")
    
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

def save_certificate(student_name, course_title, file_path, cert_type="course"):
    """Save certificate to file system"""
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    buffer = generate_certificate(student_name, course_title, cert_type)
    with open(file_path, 'wb') as f:
        f.write(buffer.getvalue())
    return file_path
