from extensions import db

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
