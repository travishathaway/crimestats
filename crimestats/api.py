import pandas as pd
from flask import g
from flask_restful import Resource
from webargs import fields
from webargs.flaskparser import use_args
from sqlalchemy import func

from . import utils as u_


def format_response(df, f_type):
    """
    Return the desired format of the response

    :param df: pandas.DataFrame
    :param f_type: String

    :return: Dictionary
    """
    if f_type == 'keyed':
        resp = df.to_dict(orient='list')
    # Default return type
    else:
        results, cols = u_.format_for_google_chart(df)
        # Remove the date column
        cols.pop(0)
        resp = {
            'cols': cols,
            'graph_data': results
        }

    return resp


class CrimeStatsAPI(Resource):
    crime_stats_args = {
        'start_date': fields.Str(
            use=u_.string_to_date()
        ),
        'end_date': fields.Str(
            use=u_.string_to_date()
        ),
        'agg_period': fields.Str(
            use=u_.validate_period
        ),
        'format': fields.Str(
            use=u_.validate_format
        ),
        'neighborhood': fields.Str()
    }

    @use_args(crime_stats_args)
    def get(self, args):
        """
        :return:
        """
        ses = g.db.session
        group_by_col = g.IncidentCount.major_offense_type

        period_field = u_.get_period_field(args.get('agg_period'), g.IncidentCount)

        query = ses.query(
            group_by_col.label('group_by_col'),
            func.sum(g.IncidentCount.count).label('count'),
            period_field
        )

        if args.get('start_date'):
            query = query.filter(
                g.IncidentCount.date >= args.get('start_date')
            )

        if args.get('end_date'):
            query = query.filter(
                g.IncidentCount.date <= args.get('end_date')
            )

        if args.get('neighborhood'):
            query = query.filter(
                g.IncidentCount.neighborhood == args.get('neighborhood')
            )

        query = query.group_by(
            group_by_col, period_field
        )

        # Let pandas execute the SQL statement to load it straight in to
        # the Data Frame.
        df = pd.read_sql_query(query.selectable, g.db.engine)

        if not df.empty:
            df = df.pivot_table(
                index=['date'], columns=['group_by_col']
            ).fillna(0)['count']

            df = df.reset_index(level=0)
            df = u_.add_all_count(df)

        return format_response(df, args.get('format'))


class NeighborhoodsAPI(Resource):
    # We use this to keep out neighborhoods with low counts
    COUNT_THRESHOLD = 250

    def get(self, *args, **kwargs):
        """
        Retrieve a list of neighborhoods in Portland, Oregon
        :param args:
        :param kwargs:
        :return: Dictionary
        """
        cte_query = g.db.session.query(
            g.IncidentCount.neighborhood,
            func.sum(g.IncidentCount.count).label('count')
        ).group_by(g.IncidentCount.neighborhood).cte(name='hood_counts')

        results = g.db.session.query(
            cte_query.c.neighborhood, cte_query.c.count
        ).filter(
            cte_query.c.count > 250
        ).filter(
            cte_query.c.neighborhood is not None
        ).order_by(
            cte_query.c.neighborhood
        ).all()

        return {
            'data': [r[0] for r in results]
        }
