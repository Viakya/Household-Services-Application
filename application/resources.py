import time
from application.data_output_fields import *
from flask import jsonify
from flask_restful import Resource, Api, fields, reqparse, marshal_with
from flask_security import auth_required, roles_required, current_user, login_required
from application.extensions import db, cache
from application.models import User, UserRoles, ProfessionalProfile, Service, ServiceRequest, Role
from datetime import datetime
from application.tasks import send_new_request_prof, prof_accepted_request, prof_rejected_request, customer_closed_request
import os
from flask import send_from_directory

api = Api(prefix='/api')

class VerifiedProfessionalList(Resource):
	@auth_required('token')
	@login_required
	@roles_required('customer')
	@cache.cached(timeout=10)
	@marshal_with(professional_profile_data_output_fields)
	def get(self):
		# Query for all verified professionals
		verified_professionals = ProfessionalProfile.query.filter_by(verified=True).all()
		print(verified_professionals)
		return verified_professionals, 200

class ServiceRequestResource(Resource):
	def __init__(self):
		self.parser = reqparse.RequestParser()
		self.parser.add_argument('customer_id', type=int, required=True, help='Customer ID is required')
		self.parser.add_argument('professional_id', type=int, required=True, help='Professional ID is required')
		self.parser.add_argument('service_id', type=int, required=True, help='Service ID is required')
	@login_required
	@roles_required('customer')
	def post(self):
		data = self.parser.parse_args()

		customer_id = data['customer_id']
		professional_id = data['professional_id']
		service_id = data['service_id']

		customer = User.query.get(customer_id)
		professional = ProfessionalProfile.query.get(professional_id)
		service = Service.query.get(service_id)

		print(customer_id,professional_id,service_id)

		if not customer or not professional or not service:
			print("klwhdk")
			return {"error": "Invalid customer, professional, or service ID"}, 404

		# Create a new ServiceRequest, the date_of_request will automatically be set
		new_service_request = ServiceRequest(
			customer_id=customer_id,
			professional_id=professional_id,
			service_id=service_id,
			service_status='requested'  # Default status
			)
		try:
			db.session.add(new_service_request)
			db.session.commit()
			msgg = send_new_request_prof(professional.user.email)
			return {"message": "Service request created successfully",}, 201
		except Exception as e:
			db.session.rollback()
			return {"error": str(e)}, 500


class ServiceRequestsByCustomer(Resource):
	@login_required
	@roles_required('customer')
	def get(self, customer_id):
		# Query to fetch all service requests for a given customer_id
		service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()

		# If no service requests found, return a 404 error
		if not service_requests:
			return {"message": "No service requests found for the given customer ID."}, 404

		# Convert the list of service requests to JSON format
		response_data = [
				{
				"id": request.id,
				"customer_id": request.customer_id,
				"professional_id": User.query.get(request.professional_id).name,
				"service_id": Service.query.get(request.service_id).name,
				"cost": Service.query.get(request.service_id).price,
				"date_requested": request.date_of_request,
				"status": request.service_status,
				}
				for request in service_requests
				]
		return jsonify(response_data)

class ServiceRequestedToProfessional(Resource):
	@login_required
	@roles_required('professional')
	def get(self, professional_id):
		#query to get all the request coming to professional
		service_prof = ServiceRequest.query.filter_by(professional_id=professional_id).all()

		if not service_prof:
			return {"message": "No service request found to the given professional ID"}, 404

		response_prof = [
			{
			"id": request.id,
			"customer_id": User.query.get(request.customer_id).name,
			"professional_id": User.query.get(request.professional_id).name,
			"service_id": Service.query.get(request.service_id).name,
			"cost": Service.query.get(request.service_id).price,
			"date_requested": request.date_of_request,
			"status": request.service_status,
			}
			for request in service_prof
		]
		return jsonify(response_prof)

class ProfAcceptRequest(Resource):
	@login_required
	@roles_required('professional')
	def patch(self,request_id):
		service_request = ServiceRequest.query.get(request_id)
		if not service_request:
			return {"message": "Service request not found"}, 404
			# Update the status field
		try:
			service_request.service_status = 'accepted'
			db.session.commit()
			custo_email = User.query.get(service_request.customer_id).email
			service_name = Service.query.get(service_request.service_id).name
			msggg = prof_accepted_request(custo_email,service_name,service_request.id)
		except:
			return {"message":"some issue while changing the status"}, 500
		return {"message": "status changed to accepted"}, 200

class ProfRejectRequest(Resource):
	@login_required
	@roles_required('professional')
	def patch(self,request_id):
		service_request = ServiceRequest.query.get(request_id)
		if not service_request:
			return {"message": "Service request not found"}, 404
		# we need to do a validation to make sure we are rejection only if the status is requested 
		try:
			service_request.service_status = 'rejected'
			db.session.commit()
			custo_email = User.query.get(service_request.customer_id).email
			service_name = Service.query.get(service_request.service_id).name
			msggg = prof_rejected_request(custo_email,service_name,service_request.id)
		except:
			return {"message":"some issue while changing the status"}, 500
		return {"message": "status changed to rejected"}, 200

class CustCancelRequest(Resource):
	@login_required
	@roles_required('customer')
	def patch(self,request_id):
		service_request = ServiceRequest.query.get(request_id)
		if not service_request:
			return {"message": "Service request not found"}, 404
		# we need to do a validation to make sure we are cancelled only if the status is requested or accepted 
		try:
			service_request.service_status = 'cancelled'
			db.session.commit()
		except:
			return {"message":"some issue while changing the status"}, 500
		return {"message": "status changed to cancelled"}, 200

class CustCloseRequest(Resource):
	@login_required
	@roles_required('customer')
	def patch(self,request_id):
		service_request = ServiceRequest.query.get(request_id)
		if not service_request:
			return {"message": "Service request not found"}, 404
		# we need to do a validation to make sure we are rejection only if the status is accepted
		try:
			service_request.service_status = 'closed'
			service_request.date_of_completion = datetime.utcnow()
			db.session.commit()
			msgg = customer_closed_request(request_id)
		except:
			return {"message":"some issue while changing the status"}, 500
		return {"message": "status changed to close"}, 200

class CustProfile(Resource):
    @login_required
    @roles_required('customer')
    def get(self, user_id):
        user_details = User.query.get(user_id)
        if not user_details:
            return {"message": "User not found"}, 404
        
        # Serialize the user object into JSON-friendly format
        user_data = {
            "id": user_details.id,
            "name": user_details.name,
            "email": user_details.email,
            "active": user_details.active,
            "joined_on": user_details.joined_on.strftime('%d %b %Y, %I:%M %p'),
            "pincode": user_details.pincode,  # Convert datetime to string
        }
        return user_data, 200

class ProfProfile(Resource):
	@login_required
	@roles_required('professional')
	@marshal_with(professional_profile_data_output_fields)
	def get(self,user_id):
		prof_data = ProfessionalProfile.query.get(user_id)
		return prof_data, 200

class CustSearchServiceName(Resource):
	@login_required
	@roles_required('customer')
	@marshal_with(professional_profile_data_output_fields)
	def get(self,service_name):
		try:
			print(service_name)
			#sss = Service.query.filter_by(name=service_name).first()
			sss = Service.query.filter(Service.name.ilike(service_name)).first()
			if not sss:
				return {"message" : "service name not found"}, 404
			ss_id = sss.id
			all_proff = ProfessionalProfile.query.filter_by(service_id=ss_id).all()
		except:
			return {"message":"some error occured"}, 500
		return all_proff, 200

class CustSearchPincode(Resource):
	@login_required
	@roles_required('customer')
	@marshal_with(professional_profile_data_output_fields)
	def get(self, pincode):
		try:
			# Query ProfessionalProfiles and filter by associated User's pincode
			all_prof = ProfessionalProfile.query.filter(ProfessionalProfile.user.has(pincode=pincode)).all()
			if not all_prof:
				return {"message": "No professionals found for this pincode"}, 404
		except:
			return {"message": "Some error occurred"}, 500
		return all_prof, 200

class AllUsers(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=10)
	@marshal_with(user_data_output_fields)
	def get(self):
		try:
			all_users = User.query.all()
		except:
			return {"message":"Some error"}, 500
		return all_users, 200

class AllRoles(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=10)
	@marshal_with(role_data_output_fields)
	def get(self):
		try:
			all_roles = Role.query.all()
		except:
			return {"message":"some error"}, 500
		return all_roles, 200

class AllUserRoles(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=10)
	@marshal_with(user_roles_data_output_fields)
	def get(self):
		try:
			all_user_roles = UserRoles.query.all()
		except:
			return {"message":"some error"}, 500
		return all_user_roles, 200

class AllProfessionalProfile(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=20)
	@marshal_with(professional_profile_data_output_fields)
	def get(self):
		try:
			all_proff_profile = ProfessionalProfile.query.all()
		except:
			return {"message":"some error"}, 500
		return all_proff_profile, 200

class AllServices(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=20)
	@marshal_with(service_data_output_fields)
	def get(self):
		try:
			all_services = Service.query.all()
		except:
			return {"message":"some error"}, 500
		return all_services, 200

class AllServiceRequest(Resource):
	@login_required
	@roles_required('admin')
	@cache.cached(timeout=20)
	@marshal_with(service_request_data_output_fields)
	def get(self):
		try:
			all_service_request = ServiceRequest.query.all()
		except:
			return {"message":"some error"}, 500
		return all_service_request, 200

class UnapprovedProf(Resource):
	@login_required
	@roles_required('admin')
	@marshal_with(professional_profile_data_output_fields)
	def get(self):
		try:
			unapproved_prof = ProfessionalProfile.query.filter_by(verified=False).all()
		except:
			return {"message":"some error"}, 500
		return unapproved_prof, 200

class AdminApproveProf(Resource):
	@login_required
	@roles_required('admin')
	def get(self,prof_id):
		try:
			proff = ProfessionalProfile.query.get(prof_id)
			proff.verified = True 
			db.session.commit()
		except:
			return {"message":"some error"}, 500
		return {"message":"done"}, 200

class AdminAddService(Resource):
	def __init__(self):
		self.add_service_parser = reqparse.RequestParser()
		self.add_service_parser.add_argument("name", type=str, required=True, help="Name is required.")
		self.add_service_parser.add_argument("price", type=float, required=True, help="Price is required.")
		self.add_service_parser.add_argument("time_required", type=int, required=True, help="Time required is required.")
		self.add_service_parser.add_argument("description", type=str, required=True, help="Description is required.")
	@login_required
	@roles_required('admin')
	def post(self):
		args = self.add_service_parser.parse_args()
		name = args["name"]

		# Check if service name already exists
		if Service.query.filter_by(name=name).first():
			return {"message": "Service with this name already exists."}, 400

		# Create and add the new service
		new_service = Service(name=name,price=args["price"],time_required=args["time_required"],description=args["description"],)
		try:
			db.session.add(new_service)
			db.session.commit()
		except:
			db.session.rollback()
			return {"message": "Error while adding service."}, 500
		return {"message": "Service added successfully."}, 200

class AdminDashboardData(Resource):
	@login_required
	@roles_required('admin')
	def get(self):
		num_prof = ProfessionalProfile.query.count()
		users = User.query.count()
		num_customer = users - num_prof
		total_services = Service.query.count()
		total_service_request = ServiceRequest.query.count()
		total_closed_service_request = ServiceRequest.query.filter_by(service_status='closed').count()
		to_send = {
					"total_users": users,
					"total_prof": num_prof,
					"total_customer": num_customer,
					"total_services_offered": total_services,
					"total_received_request": total_service_request,
					"total_closed_service_request": total_closed_service_request,
				}
		return to_send, 200

class Get_User_Pdfs(Resource):
	@login_required
	@roles_required('customer')
	def get(self,user_id):
		pdf_directory = 'cust_downloads'
		pdfs = []

		# List all the files in the cust_reports folder
		for filename in os.listdir(pdf_directory):
			if filename.endswith(f"-{user_id}.pdf"):
				pdfs.append(filename)
		return jsonify({'pdfs': pdfs})

class Download_User_Pdf(Resource):
	@login_required
	@roles_required('customer')
	def get(self,filename):
		pdf_directory = 'cust_downloads'
		try:
			if os.path.exists(os.path.join(pdf_directory, filename)):
				return send_from_directory(pdf_directory, filename, as_attachment=True)
			else:
				return jsonify({"error": "File not found"}), 404
		except Exception as e:
			return jsonify({"error": str(e)}), 500

class Get_Prof_Pdfs(Resource):
	@login_required
	@roles_required('professional')
	def get(self,prof_id):
		pdf_directory = 'prof_downloads'
		pdfs = []
		#list all filenames
		for filename in os.listdir(pdf_directory):
			if filename.endswith(f"-{prof_id}.pdf"):
				pdfs.append(filename)
		return jsonify({'pdfs': pdfs})

class Download_Prof_Pdf(Resource):
	@login_required
	@roles_required('professional')
	def get(self,filename):
		pdf_directory = 'prof_downloads'
		try:
			if os.path.exists(os.path.join(pdf_directory, filename)):
				return send_from_directory(pdf_directory, filename, as_attachment=True)
			else:
				return jsonify({'error':"File not found"}), 404
		except Exception as e:
			return jsonify({"error": str(e)}), 500

class Get_Admin_Pdfs(Resource):
	@login_required
	@roles_required('admin')
	def get(self):
		pdf_directory = 'admin_downloads'
		pdfs = []
		for filename in os.listdir(pdf_directory):
			pdfs.append(filename)
		return jsonify({'pdfs': pdfs})

class Download_Admin_Pdf(Resource):
	@login_required
	@roles_required('admin')
	def get(self,filename):
		pdf_directory = 'admin_downloads'
		try:
			if os.path.exists(os.path.join(pdf_directory, filename)):
				return send_from_directory(pdf_directory, filename, as_attachment=True)
			else:
				return jsonify({'error':"File not found"}), 404
		except Exception as e:
			return jsonify({"error": str(e)}), 500


# Add the resource to the API with the endpoint /verified_professionals
api.add_resource(VerifiedProfessionalList, '/verified_professionals')
api.add_resource(ServiceRequestResource, '/request_service')
api.add_resource(ServiceRequestsByCustomer, '/service-requests/<int:customer_id>')
api.add_resource(ServiceRequestedToProfessional, '/prof-dash/<int:professional_id>')
api.add_resource(ProfAcceptRequest, '/prof-accept/<int:request_id>')
api.add_resource(ProfRejectRequest,'/prof-reject/<int:request_id>')
api.add_resource(CustCancelRequest,'/cust-cancel/<int:request_id>')
api.add_resource(CustCloseRequest,'/cust-close/<int:request_id>')
api.add_resource(CustProfile,'/cust-profile/<int:user_id>')
api.add_resource(ProfProfile, '/prof-profile/<int:user_id>')
api.add_resource(CustSearchServiceName, '/cust-search-name/<string:service_name>')
api.add_resource(CustSearchPincode,'/cust-search-pincode/<string:pincode>')
api.add_resource(AllUsers,'/database-allusers')
api.add_resource(AllRoles,'/database-allroles')
api.add_resource(AllUserRoles,'/database-alluserroles')
api.add_resource(AllProfessionalProfile,'/database-prof')
api.add_resource(AllServices,'/database-ser')
api.add_resource(AllServiceRequest,'/database-req')
api.add_resource(UnapprovedProf,'/admin-unapproved-prof')
api.add_resource(AdminApproveProf,'/admin-approve-prof/<int:prof_id>')
api.add_resource(AdminAddService,'/admin-add-service')
api.add_resource(AdminDashboardData,'/admin-dashboard-data')
api.add_resource(Get_User_Pdfs, '/get-user-pdfs/<int:user_id>')
api.add_resource(Download_User_Pdf,'/download-user-pdf/<string:filename>')
api.add_resource(Get_Prof_Pdfs,'/get-prof-pdfs/<int:prof_id>')
api.add_resource(Download_Prof_Pdf,'/download-prof-pdf/<string:filename>')
api.add_resource(Get_Admin_Pdfs,'/get-admin-pdfs')
api.add_resource(Download_Admin_Pdf,'/download-admin-pdf/<string:filename>')