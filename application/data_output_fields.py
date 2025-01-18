from flask_restful import fields

# Output fields for the User model
user_data_output_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "email": fields.String,
    "active": fields.Boolean,
    "fs_uniquifier": fields.String,
    "joined_on": fields.DateTime,
    "pincode": fields.String,
    "roles": fields.List(fields.String),  # Assuming a list of role names or IDs
}

# Output fields for the Role model
role_data_output_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String,
}

# Output fields for the UserRoles association model
user_roles_data_output_fields = {
    "id": fields.Integer,
    "user_id": fields.Integer,
    "role_id": fields.Integer,
}

professional_profile_data_output_fields = {
    "user_id": fields.Integer,
    "experience": fields.Integer,
    "verified": fields.Boolean,
    "service_id": fields.Integer,
    "service": fields.Nested({
        "id": fields.Integer,
        "name": fields.String,
        "price": fields.Float,
        "time_required": fields.Integer,
        "description": fields.String,
    }),
    "user": fields.Nested({
        "id": fields.Integer,
        "name": fields.String,
        "email": fields.String,
        "active": fields.Boolean,
        "pincode": fields.String,
    })
}

# Output fields for the Service model
service_data_output_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "price": fields.Float,
    "time_required": fields.Integer,
    "description": fields.String,
}

# Output fields for the ServiceRequest model
service_request_data_output_fields = {
    "id": fields.Integer,
    "service_id": fields.Integer,
    "customer_id": fields.Integer,
    "professional_id": fields.Integer,
    "date_of_request": fields.DateTime,
    "date_of_completion": fields.DateTime,
    "service_status": fields.String,
    "remarks": fields.String,
    "service": fields.Nested(service_data_output_fields),  # Include nested Service data
    "customer": fields.Nested(user_data_output_fields),    # Include nested Customer data
    "professional": fields.Nested(professional_profile_data_output_fields)  # Include nested Professional data
}
