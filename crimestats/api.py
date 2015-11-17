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
        ),
        'start_date': fields.Str(
            use=u_.string_to_date()
        ),
        'end_date': fields.Str(
            use=u_.string_to_date()
        )
    }

    @use_args(crime_stats_args)
    def get(self, args):
        """

        :return:
        """
        ses = g.db.session
        cols = []
        results = []
        group_by_col = getattr(g.IncidentCount, args.get('group_by') or 'major_offense_type')

        query = ses.query(
            g.IncidentCount.date.label('date'),
            group_by_col.label('group_by_col'),
            func.sum(g.IncidentCount.count).label('count')
        )

        if args.get('start_date'):
            query = query.filter(
                g.IncidentCount.date >= args.get('start_date')
            )

        if args.get('end_date'):
            query = query.filter(
                g.IncidentCount.date <= args.get('end_date')
            )

        query = query.group_by(
            group_by_col, g.IncidentCount.date
        )

        # Let pandas execute the SQL statement to load it straight in to
        # the Dataframe.
        df = pd.read_sql_query(query.selectable, g.db.engine)
        if not df.empty:
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
            'cols': cols,
            'graph_data': results
        }
