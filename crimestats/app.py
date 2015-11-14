from flask import Flask, g
from flask_restful import Api
from flask_sqlalchemy import SQLAlchemy

import views
import settings
from api import CrimeStatsAPI

app = Flask(__name__)
api = Api(app, prefix='/api')

db_uri = 'postgresql://{user}:{pass}@{host}:{port}/{database}'.format(
    **settings.DB_CONFIG
)

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
db = SQLAlchemy(app)

from models import CrimeStats, CrimeStatsYearMonth

api.add_resource(CrimeStatsAPI, '/crime_stats')


@app.before_request
def before_request():
    g.db = db
    g.CrimeStats = CrimeStats
    g.CrimeStatsYearMonth = CrimeStatsYearMonth
