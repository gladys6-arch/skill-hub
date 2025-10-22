
import os

def generate_certificate(student_name, course_title):
    os.makedirs("certificates", exist_ok=True)
    file_name = f"certificates/{student_name.replace(' ', '_')}_{course_title}.txt"
    with open(file_name, "w") as f:
        f.write(f"Certificate of Completion\n")
        f.write(f"This certifies that {student_name} has successfully completed {course_title}.\n")
    return file_name

