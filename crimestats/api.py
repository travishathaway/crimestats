from sqlalchemy import *
from flask import g
from flask_restful import Resource
from webargs import fields
from webargs.flaskparser import use_args 
import pandas as pd

MAJOR_OFFENSES_BY_YEAR = """
"""

MAJOR_OFFENSES_BY_YEAR_MONTH = """
SELECT * FROM major_offense_type_by_year_month;
"""


crime_stats_args = {
    'major_offense_type': fields.List(fields.Str())
}


class CrimeStatsAPI(Resource):
    @use_args(crime_stats_args)
    def get(self, args):
        """

        :return:
        """

        # major_offense_by_year_month = Table(
        #     "major_offense_type_by_year_month", g.db.metadata,
        #     Column("date", Date),
        #     Column("major_offense_type", Unicode(23)),
        #     Column("count", Integer),
        #     autoload=True, autoload_with=g.db.engine
        # )
        ses = g.db.session

        query = ses.query(g.CrimeStatsYearMonth)

        if args.get('major_offense_type'):
            query = query.filter(
                g.CrimeStatsYearMonth.major_offense_type.in_(
                    args.get('major_offense_type')
                )
            )

        results = query.all()
        res = [r.to_dict() for r in results]

        df = pd.DataFrame(res)

        df = df.pivot_table(
            index=['date'], columns=['major_offense_type']
        ).fillna(0)['count']
 
        data = df.reset_index(level=0).to_dict(orient='split')
    
        return {
            'graph_data': data
        }
