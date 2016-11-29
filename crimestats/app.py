from __future__ import absolute_import

from flask import Flask, g
import flask_restful
from flask_sqlalchemy import SQLAlchemy

from . import settings
from .api import CrimeStatsAPI, NeighborhoodsAPI

app = Flask(__name__)

db_uri = 'postgresql://{user}:{pass}@{host}:{port}/{database}'.format(
    **settings.DB_CONFIG
)


api = flask_restful.Api(app, prefix='/api')

app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
db = SQLAlchemy(app)

from .models import (
    CrimeStats, IncidentCount,
)

api.add_resource(CrimeStatsAPI, '/crime_stats')
api.add_resource(NeighborhoodsAPI, '/neighborhoods')


@app.before_request
def before_request():
    g.db = db
    g.CrimeStats = CrimeStats
    g.IncidentCount = IncidentCount
