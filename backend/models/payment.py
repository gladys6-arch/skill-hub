from extensions import db

class Payment(db.Model):
   id  = db.Column(db.Integer, primary_key=True)
   student_id = db.Column(db.Integer, db.ForeignKey('user.id'))
   course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=True)
   skill_id = db.Column(db.Integer, db.ForeignKey('skill.id'), nullable=True)
   amount = db.Column(db.Float)
   teacher_share = db.Column(db.Float)
   admin_share = db.Column(db.Float)
   status = db.Column(db.String(20), default = 'paid')
   payment_type = db.Column(db.String(20))

   #relationships
   student = db.relationship('User', back_populates='payments')
   course = db.relationship('Course', back_populates='payments')
   skill = db.relationship('Skill', foreign_keys=[skill_id])