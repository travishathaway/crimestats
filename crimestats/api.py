from sqlalchemy.dialects import postgresql
from flask import g
from flask_restful import Resource
from webargs import fields
from webargs.flaskparser import use_args 
import pandas as pd


def format_for_google_chart(df):
    """
    Formats a Pandas data frame for use in Angular Google
    Charts.

    :param df: pandas.Dataframe
    :returns: Dictionary
    """
    data = df.to_dict(orient='split')

    results = {}
    results['cols'] = []
    results['rows'] = []

    for col in data['columns']:
        if col == 'date':
            results['cols'].append({
                "id": col,
                "type": "date",
                "label": col
            })
        else:
            results['cols'].append({
                "id": col,
                "type": "number",
                "label": col
            })

    for row in data['data']:
        r = []
        for val in row:
            r.append({
                "v": val
            })
        results['rows'].append({
            "c": r
        })

    return results


class CrimeStatsAPI(Resource):
    crime_stats_args = {
        'major_offense_type': fields.List(fields.Str())
    }

    @use_args(crime_stats_args)
    def get(self, args):
        """

        :return:
        """
        ses = g.db.session

        query = ses.query(g.CrimeStatsYearMonth)

        if args.get('major_offense_type'):
            query = query.filter(
                g.CrimeStatsYearMonth.major_offense_type.in_(
                    args.get('major_offense_type')
                )
            )

        # Let pandas execute the SQL statement to load it straight in to
        # the Dataframe.
        df = pd.read_sql_query(query.selectable, g.db.engine)
        df.rename(columns={
            'major_offense_type_by_year_month_date': 'date',
            'major_offense_type_by_year_month_count': 'count',
            'major_offense_type_by_year_month_major_offense_type': 'major_offense_type'
        }, inplace=True)
        # datetime.date objects are not JSON serializable
        df['date'] = df['date'].apply(lambda x: str(x))

        df = df.pivot_table(
            index=['date'], columns=['major_offense_type']
        ).fillna(0)['count']
 
        df = df.reset_index(level=0)

        results = format_for_google_chart(df)

        return {
            'results': results 
        }
