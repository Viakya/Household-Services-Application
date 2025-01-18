from application.extensions import db, security
from flask_security import UserMixin, RoleMixin
from flask_security.models import fsqla_v3 as fsq

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime  # Import DateTime



fsq.FsModels.set_db_info(db)


""" # Assuming you have an instance of ProfessionalProfile
professional_profile = ProfessionalProfile.query.get(professional_profile_id)

# Access the date_of_joining from the associated User
date_of_joining = professional_profile.user.date_of_joining
print("Date of Joining:", date_of_joining)
"""

class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String, nullable = False)
    email = db.Column(db.String, nullable = False, unique = True)
    password = db.Column(db.String, nullable = False)
    active = db.Column(db.Boolean)
    fs_uniquifier = db.Column(db.String(), nullable = False)
    roles = db.relationship('Role', secondary = 'user_roles')
    joined_on = db.Column(DateTime, default=datetime.utcnow)  # Automatically sets join date on registration
    pincode = db.Column(String(6), nullable=False)  # Optional, adjust length as per your country's pincode format 
    professional_profile = db.relationship('ProfessionalProfile', uselist=False, back_populates='user')


class Role(db.Model, RoleMixin):
    __tablename__ = 'role'
    id = db.Column(db.Integer, primary_key = True)
    name = db.Column(db.String(80), unique = True, nullable = False)
    description = db.Column(db.String)

class UserRoles(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    __tablename__ = 'user_roles'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    role_id = db.Column(db.Integer, db.ForeignKey('role.id'))

class ProfessionalProfile(db.Model):
    __tablename__ = 'professional_profile'
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), primary_key=True)
    experience = db.Column(db.Integer, nullable=False)  # Example field for years of experience
    verified = db.Column(db.Boolean, default=False)

    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)  # Foreign key to Service
    service = db.relationship('Service')  # Relationship to Service

    """ profile = ProfessionalProfile.query.get(1)  # Get a profile with ID 1
    service_name = profile.service.name  # Access the name of the associated service """

    # Add other fields specific to professionals here
    
    # Set up relationship back to User
    user = db.relationship('User', back_populates='professional_profile')


class Service(db.Model):
    __tablename__ = 'service'
    id = db.Column(db.Integer, primary_key=True)  # Unique ID for the service
    name = db.Column(db.String(50), nullable=False, unique=True)  # Service name, e.g., 'AC Servicing'
    price = db.Column(db.Float, nullable=False)  # Price for the service
    time_required = db.Column(db.Integer, nullable=False)  # Estimated time required in minutes
    description = db.Column(db.String(200), nullable=False)  # Description of the service


class ServiceRequest(db.Model):
    __tablename__ = 'service_request'
    id = db.Column(db.Integer, primary_key=True)  # Primary key for the service request
    service_id = db.Column(db.Integer, db.ForeignKey('service.id'), nullable=False)  # Foreign key to Service
    customer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Foreign key to Customer
    professional_id = db.Column(db.Integer, db.ForeignKey('professional_profile.user_id'), nullable=False)  # Foreign key to Professional
    date_of_request = db.Column(db.DateTime, default=datetime.utcnow)  # Date the request was created
    date_of_completion = db.Column(db.DateTime, nullable=True)  # Date the service was completed
    service_status = db.Column(db.String(20), nullable=False, default='requested')  # requested , accepted , closed
    remarks = db.Column(db.String(200), nullable=True)  # Additional remarks about the service request

    # Relationships
    service = db.relationship('Service', backref='service_requests')  # Relationship to Service
    customer = db.relationship('User', foreign_keys=[customer_id], backref='service_requests')  # Relationship to Customer
    professional = db.relationship('ProfessionalProfile', backref='service_requests')  # Relationship to Professional

