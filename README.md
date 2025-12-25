# Household Services Application

A comprehensive Flask-based web application for managing household services. This platform seamlessly connects customers with verified service professionals for various household tasks such as AC servicing, plumbing, and more.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [File Structure](#file-structure)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Default Credentials](#default-credentials)
- [Running the Application](#running-the-application)
- [Features Highlights](#features-highlights)
- [License](#license)
- [Contributing](#contributing)

## 🎯 Project Overview

The Household Services Application is a modern web platform designed to bridge the gap between customers seeking household services and professional service providers. Built with Flask and powered by Celery for background tasks, the application provides a robust solution for service request management, professional verification, and automated reporting.

## ✨ Key Features

### User Roles

The application supports three distinct user roles, each with specific permissions:

- **Admin**: Full administrative access to manage users, services, and approve professional registrations
- **Professional**: Service providers who can manage their profiles, accept/reject service requests, and receive automated notifications
- **Customer**: Users who can search for professionals, request services, track requests, and receive monthly reports

### Core Functionality

#### 1. User Authentication & Authorization
- Token-based authentication using Flask-Security-Too
- Role-based access control (RBAC) for secure resource management
- User registration and login with encrypted password storage
- Session management with configurable token expiration (1 hour)

#### 2. Service Management
- Admin interface to add and manage services
- Each service includes:
  - Service name
  - Price
  - Time required (in minutes)
  - Detailed description
- **Default Services**:
  - AC Servicing (₹1200, 90 minutes)
  - Plumbing (₹500, 45 minutes)

#### 3. Professional Features
- Comprehensive professional profile with:
  - Years of experience
  - Service specialization
  - Verification status
- Admin verification required before appearing in customer searches
- Service request management (accept/reject)
- Email notifications for:
  - New service requests (immediate)
  - Daily reminders for pending requests
- Monthly PDF reports with performance statistics

#### 4. Customer Features
- Advanced search capabilities:
  - Search by service name
  - Search by pincode
- Request services from verified professionals
- Real-time service request status tracking:
  - `requested` - Initial state when request is created
  - `accepted` - Professional has accepted the request
  - `rejected` - Professional has declined the request
  - `cancelled` - Customer has cancelled the request
  - `closed` - Service completed and closed by customer
- Close completed services with feedback
- Monthly PDF reports with service history

#### 5. Admin Dashboard
- Comprehensive overview with:
  - All registered users
  - Professional profiles and verification status
  - All services in the system
  - All service requests and their statuses
- Professional approval workflow:
  - Review unapproved professional registrations
  - Approve or reject professional accounts
- Service management interface
- System-wide statistics and analytics
- Monthly consolidated reports

#### 6. Background Tasks (Celery)
Automated background processing for improved user experience:

- **Daily Email Notifications** (8:02 AM)
  - Sends reminders to professionals with pending service requests
  
- **Monthly Reports Generation** (17th of each month, 1:20 AM)
  - Customer reports: Service history, spending analysis
  - Professional reports: Request statistics, earnings summary
  - Admin reports: Platform-wide analytics and insights
  
- **Scheduled Tasks** managed by Celery Beat with Redis backend

#### 7. Caching
- Redis-based caching using Flask-Caching
- Cached endpoints for improved performance (10-second TTL on verified professionals)
- Configurable timeout settings

## 🛠 Technology Stack

### Backend Framework
- **Flask 3.0.2** - Modern Python web framework
- **Python** - Core programming language

### Database
- **SQLite** - Lightweight relational database
- **SQLAlchemy ORM** - Database abstraction layer

### Authentication & Security
- **Flask-Security-Too 5.3.3** - User authentication and authorization
- Token-based authentication with configurable expiration
- Password hashing with salt

### API
- **Flask-RESTful 0.3.10** - RESTful API development

### Task Queue & Scheduling
- **Celery 5.3.6** - Distributed task queue
- **Redis** - Message broker and result backend
- **Celery Beat** - Periodic task scheduler

### Caching
- **Redis** - In-memory data store
- **Flask-Caching 2.1.0** - Flask caching extension

### Email
- **Flask-Mail 0.9.1** - Email sending functionality

### File Generation
- **pdfkit 1.0.0** - PDF generation from HTML
- **Flask-Excel 0.0.7** - Excel file handling

### Additional Libraries
- **Flask-Login** - User session management
- **Flask-Principal** - Identity and permission management
- **WTForms** - Form validation and rendering

## 📁 File Structure

```
Household-Services-Application/
├── main.py                          # Application entry point and configuration
├── application/
│   ├── models.py                    # SQLAlchemy database models
│   ├── views.py                     # Flask route handlers
│   ├── resources.py                 # RESTful API endpoints
│   ├── tasks.py                     # Celery background tasks
│   ├── extensions.py                # Flask extensions initialization
│   ├── worker.py                    # Celery worker configuration
│   ├── mail_service.py              # Email service utilities
│   └── data_output_fields.py        # API response field definitions
├── create_initial_data.py           # Database seeding script
├── celeryconfig.py                  # Celery configuration (broker, backend)
├── requirements.txt                 # Python dependencies
├── templates/                       # Jinja2 HTML templates
├── static/                          # Static assets (CSS, JS, images)
├── instance/                        # Instance-specific files (database)
└── README.md                        # Project documentation (this file)
```

## 🚀 Installation & Setup

### Prerequisites
- Python 3.8 or higher
- Redis server
- wkhtmltopdf (for PDF generation)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Household-Services-Application
```

### Step 2: Create Virtual Environment
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Install and Start Redis Server
```bash
# On Ubuntu/Debian:
sudo apt-get install redis-server
sudo service redis-server start

# On macOS (using Homebrew):
brew install redis
brew services start redis

# On Windows:
# Download Redis for Windows from https://github.com/microsoftarchive/redis/releases
# Or use Windows Subsystem for Linux (WSL)
```

### Step 5: Install wkhtmltopdf (for PDF generation)
```bash
# On Ubuntu/Debian:
sudo apt-get install wkhtmltopdf

# On macOS (using Homebrew):
brew install wkhtmltopdf

# On Windows:
# Download from https://wkhtmltopdf.org/downloads.html
```

### Step 6: Initialize Database
```bash
# The database will be automatically created when you run the application
# Initial data (users, services) will be seeded on first run
python main.py
```

## ⚙️ Configuration

The main configuration is located in `main.py`:

### Security Configuration
```python
app.config['SECRET_KEY'] = "your-secret-key-here"  # IMPORTANT: Change this in production!
app.config['SECURITY_PASSWORD_SALT'] = 'your-password-salt-here'  # IMPORTANT: Change this in production!
```

> ⚠️ **Security Warning**: Never use default or example secret keys in production. Generate strong, random secrets using tools like `python -c "import secrets; print(secrets.token_hex(32))"`

### Database Configuration
```python
app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
```

### Token Authentication
```python
app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
app.config['SECURITY_TOKEN_MAX_AGE'] = 3600  # 1 hour
app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True
```

### Cache Configuration (Redis)
```python
app.config["CACHE_TYPE"] = "RedisCache"
app.config["CACHE_REDIS_PORT"] = 6379
app.config["CACHE_DEFAULT_TIMEOUT"] = 100
```

### Celery Configuration
Located in `celeryconfig.py`:
```python
broker_url = "redis://localhost:6379/0"
result_backend = "redis://localhost:6379/1"
timezone = 'Asia/Kolkata'
```

## 🔌 API Endpoints

All API endpoints are prefixed with `/api`.

### Public/Customer Endpoints
- `GET /api/verified_professionals` - Get list of verified professionals
- `POST /api/request_service` - Create a new service request
- `GET /api/service-requests/<customer_id>` - Get customer's service requests
- `POST /api/cust-cancel/<request_id>` - Cancel a service request
- `POST /api/cust-close/<request_id>` - Close a completed service
- `GET /api/cust-profile/<user_id>` - Get customer profile
- `GET /api/cust-search-name/<service_name>` - Search professionals by service
- `GET /api/cust-search-pincode/<pincode>` - Search professionals by pincode

### Professional Endpoints
- `GET /api/prof-dash/<professional_id>` - Professional dashboard data
- `POST /api/prof-accept/<request_id>` - Accept a service request
- `POST /api/prof-reject/<request_id>` - Reject a service request
- `GET /api/prof-profile/<user_id>` - Get professional profile

### Admin Endpoints
- `GET /api/admin-dashboard-data` - Admin dashboard statistics
- `GET /api/database-allusers` - Get all users
- `GET /api/database-allroles` - Get all roles
- `GET /api/database-alluserroles` - Get all user-role mappings
- `GET /api/database-prof` - Get all professional profiles
- `GET /api/database-ser` - Get all services
- `GET /api/database-req` - Get all service requests
- `GET /api/admin-unapproved-prof` - Get unapproved professionals
- `POST /api/admin-approve-prof/<prof_id>` - Approve a professional
- `POST /api/admin-add-service` - Add a new service

### Reports & Downloads
- `GET /api/get-user-pdfs/<user_id>` - Get customer PDF reports
- `GET /api/download-user-pdf/<filename>` - Download customer PDF
- `GET /api/get-prof-pdfs/<prof_id>` - Get professional PDF reports
- `GET /api/download-prof-pdf/<filename>` - Download professional PDF
- `GET /api/get-admin-pdfs` - Get admin PDF reports
- `GET /api/download-admin-pdf/<filename>` - Download admin PDF

## 🔑 Default Credentials

The application creates default users on first run:

### Admin Account
- **Email**: `admin@iitm.ac.in`
- **Password**: `pass`
- **Role**: Administrator
- **Pincode**: 987654

### Customer Account
- **Email**: `johndoe@example.com`
- **Password**: `pass`
- **Role**: Customer
- **Pincode**: 123456

### Professional Account
- **Email**: `janesmith@example.com`
- **Password**: `pass`
- **Role**: Professional
- **Pincode**: 654321
- **Service**: AC Servicing
- **Experience**: 3 years
- **Status**: Unverified (requires admin approval)

> ⚠️ **Security Note**: Change these default credentials in production environments!

## 🏃 Running the Application

You need to run three separate processes for the application to function fully:

### 1. Flask Application (Main Server)
```bash
python main.py
```
The application will start on `http://0.0.0.0:5000`

### 2. Celery Worker (Background Tasks)
Open a new terminal window and run:
```bash
celery -A main.celery_app worker --loglevel=info
```

### 3. Celery Beat (Scheduled Tasks)
Open another terminal window and run:
```bash
celery -A main.celery_app beat --loglevel=info
```

### Alternative: Running All Services (Linux/macOS)
You can use a process manager like `supervisord` or run in separate terminal sessions.

## 🌟 Features Highlights

### For Customers
✅ Easy professional search and filtering  
✅ Real-time service request tracking  
✅ Transparent pricing and service details  
✅ Monthly service history reports  
✅ Secure payment and booking system  

### For Professionals
✅ Profile management with service specialization  
✅ Automated email notifications for requests  
✅ Daily reminders for pending work  
✅ Monthly performance reports  
✅ Flexible request acceptance workflow  

### For Administrators
✅ Complete platform oversight  
✅ Professional verification workflow  
✅ Service catalog management  
✅ Comprehensive analytics dashboard  
✅ Monthly platform reports  

### Technical Highlights
- 🔐 **Secure**: Token-based authentication with role-based access control
- ⚡ **Fast**: Redis caching for improved performance
- 📧 **Automated**: Email notifications and scheduled reports
- 📊 **Scalable**: Celery-based task queue for background processing
- 🎨 **RESTful**: Clean API design with Flask-RESTful
- 📱 **Responsive**: Modern UI with proper templating

## 📄 License

This project is currently unlicensed. Please contact the repository owner for licensing information.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a new branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines
- Follow PEP 8 style guide for Python code
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Keep commits atomic and well-described

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

---

**Built with ❤️ using Flask, Celery, and Redis**
