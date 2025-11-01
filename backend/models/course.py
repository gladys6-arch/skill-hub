from extensions import db
from .user import student_skill



class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    # Relationships
    teacher = db.relationship('User', back_populates='taught_courses')
    modules = db.relationship('Module', back_populates='course', cascade="all, delete-orphan")
    enrollments = db.relationship('Enrollment', back_populates='course', cascade="all, delete-orphan")
    payments = db.relationship('Payment', back_populates='course', cascade="all, delete-orphan")
    certificates = db.relationship('Certificate', back_populates='course', cascade="all, delete-orphan")
    reviews = db.relationship('Review', back_populates='course', cascade="all, delete-orphan")
    ratings = db.relationship('Rating', back_populates='course', cascade="all, delete-orphan")

class Skill(db.Model):
    __tablename__='skill'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True)
    description = db.Column(db.Text)
    price = db.Column(db.Float)
    teacher_id = db.Column(db.Integer, db.ForeignKey('user.id'))

    students = db.relationship('User', secondary=student_skill, back_populates='skills')
    teacher = db.relationship('User', foreign_keys=[teacher_id])
    certificates = db.relationship('Certificate', back_populates='skill', cascade="all, delete-orphan")



class Module(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    content = db.Column(db.Text)
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))

    #relationship
    course = db.relationship('Course', back_populates='modules')


class Enrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'))
    date_enrolled = db.Column(db.DateTime,  default=db.func.now())
    completed = db.Column(db.Boolean, default=False)

    #relationships
    student = db.relationship('User', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')

    @property
    def progress(self):
        """Calculate progress as percentage based on completed modules"""
        from .course import Module, ModuleProgress
        total_modules = Module.query.filter_by(course_id=self.course_id).count()
        if total_modules == 0:
            return 100 if self.completed else 0
        completed_modules = ModuleProgress.query.filter_by(
            student_id=self.student_id,
            completed=True
        ).join(Module).filter(Module.course_id == self.course_id).count()
        return int((completed_modules / total_modules) * 100)


class SkillEnrollment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'))
    date_enrolled = db.Column(db.DateTime, default=db.func.now())
    progress = db.Column(db.Integer, default=0)
    completed = db.Column(db.Boolean, default=False)

    #relationships
    student = db.relationship('User', foreign_keys=[student_id])
    skill = db.relationship('Skill', foreign_keys=[skill_id])


class ModuleProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    # Enhanced fields for component tracking
    quiz_completed = db.Column(db.Boolean, default=False)
    reading_completed = db.Column(db.Boolean, default=False)
    interactive_completed = db.Column(db.Boolean, default=False)
    time_verified = db.Column(db.Boolean, default=False)
    # Anti-cheating flags
    anti_cheat_flags = db.Column(db.Text, nullable=True)  # JSON string for flags

    #relationships
    student = db.relationship('User', foreign_keys=[student_id])
    module = db.relationship('Module', foreign_keys=[module_id])


# Assessment System Models
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200))
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    passing_score = db.Column(db.Integer, default=70)  # Percentage

    # Relationships
    module = db.relationship('Module', back_populates='quizzes')
    questions = db.relationship('Question', back_populates='quiz', cascade="all, delete-orphan")
    attempts = db.relationship('QuizAttempt', back_populates='quiz', cascade="all, delete-orphan")


class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    question_text = db.Column(db.Text)
    question_type = db.Column(db.String(50))  # 'multiple_choice', 'true_false', etc.

    # Relationships
    quiz = db.relationship('Quiz', back_populates='questions')
    answers = db.relationship('Answer', back_populates='question', cascade="all, delete-orphan")
    responses = db.relationship('QuizResponse', back_populates='question', cascade="all, delete-orphan")


class Answer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    answer_text = db.Column(db.Text)
    is_correct = db.Column(db.Boolean, default=False)

    # Relationships
    question = db.relationship('Question', back_populates='answers')


# Quiz Attempt Tracking Models
class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'))
    started_at = db.Column(db.DateTime, default=db.func.now())
    completed_at = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Integer, nullable=True)  # Percentage

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])
    quiz = db.relationship('Quiz', back_populates='attempts')
    responses = db.relationship('QuizResponse', back_populates='attempt', cascade="all, delete-orphan")


class QuizResponse(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('quiz_attempt.id'))
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'))
    selected_answer_id = db.Column(db.Integer, db.ForeignKey('answer.id'), nullable=True)
    response_text = db.Column(db.Text, nullable=True)  # For open-ended questions

    # Relationships
    attempt = db.relationship('QuizAttempt', back_populates='responses')
    question = db.relationship('Question', back_populates='responses')
    selected_answer = db.relationship('Answer', foreign_keys=[selected_answer_id])


# Time Verification Models
class ModuleTimeRequirement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    required_time_minutes = db.Column(db.Integer)

    # Relationships
    module = db.relationship('Module', back_populates='time_requirement')


class StudentTimeTracking(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    time_spent_seconds = db.Column(db.Integer, default=0)
    last_accessed = db.Column(db.DateTime, default=db.func.now())

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])
    module = db.relationship('Module', foreign_keys=[module_id])


# Reading Completion Tracking Models
class ReadingSection(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    title = db.Column(db.String(200))
    content = db.Column(db.Text)

    # Relationships
    module = db.relationship('Module', back_populates='reading_sections')
    progress = db.relationship('ReadingProgress', back_populates='reading_section', cascade="all, delete-orphan")


class ReadingProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    reading_section_id = db.Column(db.Integer, db.ForeignKey('reading_section.id'))
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])
    reading_section = db.relationship('ReadingSection', back_populates='progress')


# Interactive Elements Models
class InteractiveElement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    element_type = db.Column(db.String(50))  # 'video', 'simulation', etc.
    content = db.Column(db.Text)  # JSON or description

    # Relationships
    module = db.relationship('Module', back_populates='interactive_elements')
    completions = db.relationship('InteractiveCompletion', back_populates='interactive_element', cascade="all, delete-orphan")


class InteractiveCompletion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    interactive_element_id = db.Column(db.Integer, db.ForeignKey('interactive_element.id'))
    completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    student = db.relationship('User', foreign_keys=[student_id])
    interactive_element = db.relationship('InteractiveElement', back_populates='completions')


# Module Completion Criteria Model
class ModuleCompletionCriteria(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    module_id = db.Column(db.Integer, db.ForeignKey('module.id'))
    criteria_type = db.Column(db.String(50))  # 'quiz', 'reading', 'time', 'interactive'
    required_value = db.Column(db.String(100))  # e.g., '70' for score, 'all' for reading

    # Relationships
    module = db.relationship('Module', back_populates='completion_criteria')


# Update existing Module model to include new relationships
Module.quizzes = db.relationship('Quiz', back_populates='module', cascade="all, delete-orphan")
Module.time_requirement = db.relationship('ModuleTimeRequirement', back_populates='module', uselist=False)
Module.reading_sections = db.relationship('ReadingSection', back_populates='module', cascade="all, delete-orphan")
Module.interactive_elements = db.relationship('InteractiveElement', back_populates='module', cascade="all, delete-orphan")
Module.completion_criteria = db.relationship('ModuleCompletionCriteria', back_populates='module', cascade="all, delete-orphan")


