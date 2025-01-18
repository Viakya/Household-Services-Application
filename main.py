from flask import Flask
import application.views
import application.resources
from application.extensions import db, security, cache
from create_initial_data import create_data
from flask_caching import Cache
import flask_excel as excel
from application.worker import celery_init_app
from application.tasks import send_mail_all_prof_pending_request, cust_monthly_reports, prof_monthly_reports, admin_monthly_reports
from celery.schedules import crontab
from datetime import datetime


celery_app = None


def create_app():
    app = Flask(__name__)

    app.config['SECRET_KEY'] = "should-not-be-exposed"
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:///data.db"
    app.config['SECURITY_PASSWORD_SALT'] = 'salty-password'

    # configure token
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'
    app.config['SECURITY_TOKEN_MAX_AGE'] = 3600 #1hr
    app.config['SECURITY_LOGIN_WITHOUT_CONFIRMATION'] = True

    # cache config
    app.config["CACHE_DEFAULT_TIMEOUT"] = 100
    app.config["DEBUG"] = True
    app.config["CACHE_TYPE"] = "RedisCache"
    app.config["CACHE_REDIS_PORT"] = 6379

    cache.init_app(app)
    db.init_app(app)
    

    with app.app_context():

        from application.models import User, Role
        from flask_security import SQLAlchemyUserDatastore

        user_datastore = SQLAlchemyUserDatastore(db, User, Role) 

        security.init_app(app, user_datastore)

        db.create_all()
        
        create_data(user_datastore)

    app.config['WTF_CSRF_CHECK_DEFAULT'] = False
    app.config['SECURITY_CSRF_PROTECT_MECHANISHMS'] = []
    app.config['SECURITY_CSRF_IGNORE_UNAUTH_ENDPOINTS'] = True

    application.views.create_views(app, user_datastore, cache)

    # connect flask to flask_restful
    application.resources.api.init_app(app)
    return app


app = create_app()
celery_app = celery_init_app(app)
excel.init_excel(app)

@celery_app.task
def task_prof_monthly_reports():
    current_month = datetime.utcnow().strftime('%B')
    current_year = datetime.utcnow().year
    # Use `current_month` and `current_year` here
    prof_monthly_reports.delay(current_month,current_year)

@celery_app.task
def task_cust_monthly_reports():
    current_monthh = datetime.utcnow().strftime('%B')
    current_yearr = datetime.utcnow().year
    cust_monthly_reports.delay(current_monthh, current_yearr)

@celery_app.task
def task_send_daily_profs():
    send_mail_all_prof_pending_request.delay()

@celery_app.task
def task_admin_monthly_reports():
    mmm = datetime.utcnow().strftime('%B')
    yyy = datetime.utcnow().year
    admin_monthly_reports.delay(mmm, yyy)

@celery_app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    sender.add_periodic_task(
        crontab(minute=2, hour=8),
        task_send_daily_profs.s(),
        )
    sender.add_periodic_task(
        crontab(minute=20, hour=1, day_of_month=17),
        task_cust_monthly_reports.s(),
        )
    sender.add_periodic_task(
        crontab(minute=20, hour=1, day_of_month=17),
        task_prof_monthly_reports.s(),
        )
    sender.add_periodic_task(
        crontab(minute=20, hour=1, day_of_month=17),
        task_admin_monthly_reports.s(),
        )

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000,debug=True)
