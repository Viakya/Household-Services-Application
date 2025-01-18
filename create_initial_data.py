from datetime import datetime, timedelta
from flask_security import SQLAlchemyUserDatastore
from flask_security.utils import hash_password
from application.extensions import db
from application.models import ProfessionalProfile, Service, ServiceRequest



def create_data(user_datastore : SQLAlchemyUserDatastore):
    # Step 1: Create roles or find them if they already exist
    user_datastore.find_or_create_role(name="admin", description="Administrator with full access")
    user_datastore.find_or_create_role(name="professional", description="Service provider")
    user_datastore.find_or_create_role(name="customer", description="Can request and review services")

    # Commit roles to the database
    db.session.commit()

    # Step 2: Create users with roles or find them if they already exist
    if not user_datastore.find_user(email="admin@iitm.ac.in"):
        user_datastore.create_user(
            name="Admin User",
            email="admin@iitm.ac.in",
            password=hash_password("pass"),
            active=True,
            joined_on=datetime.utcnow() - timedelta(days=120),
            pincode="987654",
            roles=["admin"]
            )

    if not user_datastore.find_user(email="johndoe@example.com"):
        user_datastore.create_user(
            name="John Doe",
            email="johndoe@example.com",
            password=hash_password("pass"),
            active=True,
            joined_on=datetime.utcnow() - timedelta(days=45),
            pincode="123456",
            roles=["customer"]
            )
    if not user_datastore.find_user(email="janesmith@example.com"):
        user_datastore.create_user(
            name="Jane Smith",
            email="janesmith@example.com",
            password=hash_password("pass"),
            active=True,
            joined_on=datetime.utcnow() - timedelta(days=90),
            pincode="654321",
            roles=["professional"]
            )
    # Commit users to the database
    db.session.commit()

    # Step 3: Create services if they don’t already exist
    if not Service.query.filter_by(name="AC Servicing").first():
        service_ac = Service(
            name="AC Servicing",
            price=1200.0,
            time_required=90,
            description="Complete air conditioning service"
            )
        db.session.add(service_ac)

    if not Service.query.filter_by(name="Plumbing").first():
        service_plumbing = Service(
            name="Plumbing",
            price=500.0,
            time_required=45,
            description="Fixing basic plumbing issues"
            )
        db.session.add(service_plumbing)

    # Commit services to the database
    db.session.commit()

    # Step 4: Create professional profile if not exists
    professional_user = user_datastore.find_user(email="janesmith@example.com")
    if professional_user and not ProfessionalProfile.query.filter_by(user_id=professional_user.id).first():
        professional_profile = ProfessionalProfile(
            user_id=professional_user.id,
            experience=3,
            verified=False,
            service_id=Service.query.filter_by(name="AC Servicing").first().id
            )
        db.session.add(professional_profile)
    db.session.commit()
    print("Dummy data created with checks for existing records!")
