import pandas as pd

from flask import g
from flask_restful import Resource
from webargs import fields
from webargs.flaskparser import use_args
from sqlalchemy import func

import utils as u_
from .constants import MAJOR_OFFENSE_TYPES


def validate_group_by(value):
    """
    Validate the group_by field.

    :param value: String
    :return: String
    :raises: ValueError
    """
    if value not in CrimeStatsAPI.INCIDENT_GROUP_BY:
        raise ValueError(
            "'group_by' must appear in {}".format(CrimeStatsAPI.INCIDENT_GROUP_BY)
        )
    return value


class CrimeStatsAPI(Resource):
    INCIDENT_GROUP_BY = ('major_offense_type', 'neighborhood', 'police_precinct')

    crime_stats_args = {
        'group_by': fields.Str(
            validate=validate_group_by
        )
    }

    @use_args(crime_stats_args)
    def get(self, args):
        """

        :return:
        """
        ses = g.db.session
        group_by_col = getattr(g.IncidentCount, args.get('group_by') or 'major_offense_type')

        query = ses.query(
            g.IncidentCount.date.label('date'),
            group_by_col.label('group_by_col'),
            func.sum(g.IncidentCount.count).label('count')
        )

        query = query.group_by(
            group_by_col, g.IncidentCount.date
        )
        query = query.filter(
            g.IncidentCount.count >= 3
        )

        # Let pandas execute the SQL statement to load it straight in to
        # the Dataframe.
        df = pd.read_sql_query(query.selectable, g.db.engine)
        # datetime.date objects are not JSON serializable
        df['date'] = df['date'].apply(lambda x: str(x))

        df = df.pivot_table(
            index=['date'], columns=['group_by_col']
        ).fillna(0)['count']
 
        df = df.reset_index(level=0)

        results, cols = u_.format_for_google_chart(df)

        # Remove the date column
        cols.pop(0)

        return {
            'major_offense_types': MAJOR_OFFENSE_TYPES,
            'cols': cols,
            'graph_data': results
        }
