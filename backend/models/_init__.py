from extensions import db
from .user import User, student_skill
from .course import Course, Module, Enrollment, SkillEnrollment
from .skill import Skill
from .payment import Payment
from .certificate import Certificate
from .rating import Rating
from .review import Review
from .study_session import StudySession, ChatMessage
from .teacher_request import TeacherRequest
from .module_completion import ModuleCompletion

__all__ = [
    'db', 'User', 'Course', 'Module', 'Enrollment', 'Skill', 'SkillEnrollment',
    'Payment', 'Certificate', 'Rating', 'Review', 'StudySession',
    'ChatMessage', 'TeacherRequest', 'ModuleCompletion', 'student_skill'
]
