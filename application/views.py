from flask import jsonify, render_template, render_template_string, request
from flask_security import auth_required, current_user, roles_required, roles_accepted, SQLAlchemyUserDatastore, login_user, logout_user
from flask_security.utils import hash_password, verify_password
from application.extensions import db
from application.models import ProfessionalProfile, Service, ServiceRequest, Role
import datetime
from celery.result import AsyncResult


def create_views(app, user_datastore : SQLAlchemyUserDatastore, cache):
    # cache demo
    @app.route('/cachedemo')
    @cache.cached(timeout=5)
    def cacheDemo():
        return jsonify({"time" : datetime.datetime.now()})

    @app.route('/services', methods=['GET'])
    def get_services():
        try:
            # Query the database to get all services, specifically the 'name' field
            services = Service.query.with_entities(Service.name).all()
            # Convert the query result into a list of service names
            service_names = [service.name for service in services]
            print(service_names)
            print("doing it maybe gone ")
            return jsonify(service_names)
        except:
            print("something weird error while getting all services names")

    # homepage
    @app.route('/')
    def home():
        return render_template('index.html')

    @app.route('/user-login', methods=['POST'])
    def user_login():
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message' : 'not valid email or password'}), 404

        user = user_datastore.find_user(email = email)

        if not user:
            return jsonify({'message' : 'invalid user'}), 404

        if verify_password(password, user.password):
            login_user(user)
            return jsonify({'token' : user.get_auth_token(), 'role' : user.roles[0].name, 'id' : user.id, 'email' : user.email }), 200
        else:
            return jsonify({'message' : 'wrong password'})

    @app.get('/user-logout')
    def logout():
        logout_user()
        return jsonify({'message':'Logged out'})


    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        pincode = data.get('pincode')
        role = data.get('role')
        experience = data.get('experience')
        service = data.get('service')

        if role not in ['customer', 'professional']:
            return jsonify({"message" : "invalid input"})
        elif role in ['customer']:
            if not name or not email or not password or not pincode:
                return jsonify({"message" : "invalid input"})

            if user_datastore.find_user(email=email):
                return jsonify({"message" : "user already exists"})
            active = True
            try:
                user_datastore.create_user(name = name, email = email, password =  hash_password(password), active = active, roles = [role], pincode = pincode)
                db.session.commit()
            except:
                print('error while creating')
                db.session.rollback()
                return jsonify({'message' : 'error while creating user'}), 408
            return jsonify({'message' : 'user created'}), 200
        elif role in ['professional']:
            if not name or not email or not password or not pincode or not experience or not service:
                return jsonify({"message": "invalid input"}), 400
            if user_datastore.find_user(email=email):
                return jsonify({"message": "user already exists"}), 409
            active = True
            rolee = Role.query.filter_by(name=role).first()
            servicee = Service.query.filter_by(name=service).first()

            try:
                # Step 1: Create the user entry
                professional_user = user_datastore.create_user(
                    name=name,
                    email=email,
                    password=hash_password(password),
                    active=active,
                    roles=[rolee],
                    pincode=pincode,
                    )
                db.session.flush()  # Push to the database so professional_user gets an ID

                # Step 2: Create the professional profile entry linked to the user
                professional_profile = ProfessionalProfile(user_id=professional_user.id,experience=experience,service=servicee)
                db.session.add(professional_profile)  # Add profile to the session
                # Commit both User and ProfessionalProfile entries
                db.session.commit()
                return jsonify({"message": "professional created successfully"}), 201
            except Exception as e:
                print(f"Error while creating professional: {e}")
                db.session.rollback()
                return jsonify({'message': 'error while creating professional'}), 500
            return jsonify({'message' : 'professional created'}), 200
        else:
            pass
