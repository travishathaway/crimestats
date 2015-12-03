from .app import db
from sqlalchemy.orm import relationship


class CrimeStats(db.Model):
    __tablename__ = 'portland_crime_stats'

    record_id = db.Column(db.Integer, primary_key=True)
    report_date = db.Column(db.Date)
    report_time = db.Column(db.Time)
    major_offense_type = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    neighborhood = db.Column(db.String)
    police_precinct = db.Column(db.String)
    police_district = db.Column(db.String)
    x_coordinate = db.Column(db.Float)
    y_coordinate = db.Column(db.Float)

    def to_dict(self):
        """
        Render object to dictionary
        """
        return {
            'record_id': self.record_id,
            'report_date': self.report_date.isoformat(),
            'report_time': self.report_time.isoformat(),
            'major_offense_type': self.major_offense_type,
            'address': self.address,
            'neighborhood': self.neighborhood,
            'police_precinct': self.police_precinct,
            'police_district': self.police_district,
            'x_coordinate': self.x_coordinate,
            'y_coordinate': self.y_coordinate
        }

class CrimeStatsYearMonth(db.Model):
    __tablename__ = 'major_offense_type_by_year_month'
    __table_args__ = {
        'autoload': True,
        'autoload_with': db.engine
    }

    major_offense_type = db.Column(db.String, primary_key=True)
    date = db.Column(db.Date, primary_key=True)
    count = db.Column(db.Integer)

    def to_dict(self):
        """
        Render object to dictionary
        """
        return {
            'major_offense_type': self.major_offense_type,
            'date': self.date.isoformat(),
            'count': self.count
        }


class IncidentCount(db.Model):
    __tablename__ = 'incident_counts'

    date = db.Column(db.Date, nullable=False, primary_key=True)
    major_offense_type = db.Column(db.String, primary_key=True)
    neighborhood = db.Column(db.String, primary_key=True)
    police_precinct = db.Column(db.String, primary_key=True)
    count = db.Column(db.Integer, nullable=False)
    population = relationship("PortlandPopulation", uselist=False,
                              backref="incident_counts")


class PortlandPopulation(db.Model):
    __tablename__ = 'portland_population_2000_2014'

    index = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.Date, db.ForeignKey('incident_counts.date'), nullable=False)
    pop = db.Column(db.Integer, nullable=False)
