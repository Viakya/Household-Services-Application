from celery import shared_task
import time
from flask_excel import make_response_from_query_sets
from application.models import User, UserRoles, ProfessionalProfile, Service, ServiceRequest, Role
from application.mail_service import send_email
from datetime import datetime, timedelta
from flask import Flask, render_template, make_response
import pdfkit
from sqlalchemy import func
import os

month_map = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
}

@shared_task(ignore_result = True)
def simple_mails(to,sub, message):
    send_email(to, sub, message)
    return "OK"

@shared_task
def send_mail_all_prof_pending_request():
	"""
	Sends an email to professionals who have pending requests.
	"""
	# Query all professionals
	professionals = ProfessionalProfile.query.all()
	for professional in professionals:
		# Check if the professional has any pending service requests
		pending_requests = ServiceRequest.query.filter_by(professional_id=professional.user_id, service_status='requested').all()
		if pending_requests:
			# Prepare the email content
			subject = "You have pending service requests"
			body = f"""
			<p>Dear {professional.user.name},</p>
			<p>You have {len(pending_requests)} pending service request(s). Please log in to your dashboard to take action.</p>
			<p>Best regards,<br>Your Team</p>
			"""
			# Send the email using the `send_email` function
			send_email(professional.user.email, subject, body)

@shared_task(ignore_result = True)
def send_new_request_prof(prof_email):
	subject = "You have a new service request"
	body = f"""
	<p>Dear Professional </p>
	<p>You have a new  service request !!</p>
	<p> More info on your dashboard </p>
	<p>Best regards,<br>Your Team</p>
	"""
	send_email(prof_email,subject,body)


@shared_task
def prof_accepted_request(cust_email,service_name,service_id):
	subject = "Your service request is accepted"
	body = f"""
	<p>Dear Customer </p>
	<p>Your service request of {service_name} is accepted !!</p>
	<p>Service Request id is : {service_id} </p>
	<p>More info on your dashboard </p>
	<p>Best regards,<br>Your Team</p>
	"""
	send_email(cust_email,subject,body)

@shared_task
def prof_rejected_request(cust_email,service_name,service_id):
	subject = " Your service request is rejected "
	body = f"""
	<p>Dear Customer </p>
	<p> We are sorry to inform that .. </p>
	<p>Your service request of {service_name} is rejected</p>
	<p>Service Request id is : {service_id} </p>
	<p>More info on your dashboard </p>
	<p>Best regards,<br>Your Team</p>
	"""
	send_email(cust_email,subject,body)

@shared_task
def customer_closed_request(service_id):
	service_request = ServiceRequest.query.get(service_id)
	#get customer and professional object
	customer = User.query.get(service_request.customer_id)
	professional = ProfessionalProfile.query.get(service_request.professional_id)
	service = Service.query.get(service_request.service_id)

	#prepare mail
	subject = f"Service Request Closed: {service.name}"
	body = f"""
	<p>Dear {customer.name},</p>
	<p>Your service request has been successfully closed. Here are the details:</p>
	<ul>
	<li><b>Service:</b> {service.name}</li>
	<li><b>Request ID:</b> {service_request.id}</li>
	<li><b>Price:</b> {service.price}</li>
	<li><b>Professional:</b> {professional.user.name} ({professional.user.email}) </li>
	<li><b>Date of Request:</b> {service_request.date_of_request.strftime('%Y-%m-%d %H:%M')}</li>
	<li><b>Date of Completion:</b> {service_request.date_of_completion.strftime('%Y-%m-%d %H:%M') if service_request.date_of_completion else "N/A"}</li>
	<li><b>Status:</b> {service_request.service_status}</li>
	<li><b>Remarks:</b> {service_request.remarks or "No remarks provided"}</li>
	</ul>
	<p>Thank you for using our services!</p>
	<p>Best regards,<br>Your Team</p>
	"""
	# Send email to customer
	send_email(customer.email, subject, body)

	# Prepare professional email details
	professional_body = f"""
	<p>Dear {professional.user.name},</p>
	<p>The following service request assigned to you has been successfully closed:</p>
	<ul>
	<li><b>Service:</b> {service.name}</li>
	<li><b>Request ID:</b> {service_request.id}</li>
	<li><b>Customer:</b> {customer.name} ({customer.email})</li>
	<li><b>Price:</b> {service.price}</li>
	<li><b>Date of Request:</b> {service_request.date_of_request.strftime('%Y-%m-%d %H:%M')}</li>
	<li><b>Date of Completion:</b> {service_request.date_of_completion.strftime('%Y-%m-%d %H:%M') if service_request.date_of_completion else "N/A"}</li>
	<li><b>Status:</b> {service_request.service_status}</li>
	<li><b>Remarks:</b> {service_request.remarks or "No remarks provided"}</li>
	</ul>
	<p>Thank you for your excellent service!</p>
	<p>Best regards,<br>Your Team</p>
	"""
	# Send email to professional
	send_email(professional.user.email, subject, professional_body)

@shared_task
def cust_monthly_reports(month_name,year):
	customers = User.query.filter(User.professional_profile == None).all()

	for customer in customers:
		# Fetch the user's service requests for the given month and year
		month_number = month_map.get(month_name, None)
		service_requests = ServiceRequest.query.filter(
			ServiceRequest.customer_id == customer.id,
			func.extract('month', ServiceRequest.date_of_request) == month_number,
			func.extract('year', ServiceRequest.date_of_request) == year
			).all()
		print("bbwhgdugw")
		print(service_requests)
		# Prepare the filename for the PDF
		filename = f"{month_name.lower()}-{year}-{customer.id}.pdf"
		current_date = datetime.utcnow().strftime('%Y-%m-%d')

		# Render the template for the PDF content
		rendered_html = render_template(
			'monthly_cust_report.html',
			title="Monthly Service Report",
            customer_name=customer.name,
            report_period=f"{month_name} {year}",
            service_requests=service_requests,
            generation_date=current_date,
            year=year
            )

		pdf = pdfkit.from_string(rendered_html, False)

		# Store the generated PDF file
		pdf_file_path = os.path.join('cust_downloads', filename)
		with open(pdf_file_path, 'wb') as f:
			f.write(pdf)

		# Send the PDF report via email
		subject = f"Monthly Service Report - {month_name} {year}"
		body = f"Dear {customer.name},\n\nWe have added report of {month_name} {year} to the dashboard."
		send_email(customer.email, subject, body)

@shared_task
def prof_monthly_reports(month_name,year):
	professionals = ProfessionalProfile.query.all()

	for professional in professionals:
		month_number = month_map.get(month_name, None)
		service_requests = ServiceRequest.query.filter(
			ServiceRequest.professional_id == professional.user_id,
			func.extract('month', ServiceRequest.date_of_request) == month_number,
			func.extract('year', ServiceRequest.date_of_request) == year
			).all()
		print("bbwhgdugw")
		print(service_requests)
		# Prepare the filename for the PDF
		filename = f"{month_name.lower()}-{year}-{professional.user_id}.pdf"
		current_date = datetime.utcnow().strftime('%Y-%m-%d')

		# Render the template for the PDF content
		rendered_html = render_template(
			'monthly_prof_report.html',
			title="Monthly Service Report",
            professional_name=professional.user.name,
            report_period=f"{month_name} {year}",
            service_requests=service_requests,
            generation_date=current_date,
            year=year
            )

		pdf = pdfkit.from_string(rendered_html, False)

		# Store the generated PDF file
		pdf_file_path = os.path.join('prof_downloads', filename)
		with open(pdf_file_path, 'wb') as f:
			f.write(pdf)

		# Send the PDF report via email
		subject = f"Monthly Service Report - {month_name} {year}"
		body = f"Dear {professional.user.name},\n\nWe have added report of {month_name} {year} to the dashboard."
		send_email(professional.user.email, subject, body)

@shared_task
def admin_monthly_reports(month_name,year):
	# Query all service requests for the given month and year
	month_number = month_map.get(month_name, None)

	service_requests = ServiceRequest.query.filter(
		func.extract('month', ServiceRequest.date_of_request) == month_number,
		func.extract('year', ServiceRequest.date_of_request) == year
	).all()

	# Calculate summary data
	total_requests = len(service_requests)
	pending_requests = sum(1 for req in service_requests if req.service_status == 'requested')
	cancelled_requests = sum(1 for req in service_requests if req.service_status == 'cancelled')
	completed_requests = sum(1 for req in service_requests if req.service_status == 'closed')

	# Render the HTML template
	rendered_html = render_template(
		'monthly_admin_report.html',
		service_requests=service_requests,
        month_name=month_name,
        year=year,
        total_requests=total_requests,
        cancelled_requests=cancelled_requests,
        pending_requests=pending_requests,
        completed_requests=completed_requests
        )
	pdf = pdfkit.from_string(rendered_html, False)
	filename = f"{month_name.lower()}-{year}-admin.pdf"

	pdf_file_path = os.path.join('admin_downloads', filename)
	with open(pdf_file_path, 'wb') as f:
		f.write(pdf)







