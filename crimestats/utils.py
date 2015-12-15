import datetime

from sqlalchemy import func, types
from sqlalchemy.sql import expression

__author__ = 'thath'


def format_for_google_chart(df):
    """
    Formats a Pandas data frame for use in Angular Google
    Charts.  We return the chart data along with all columns

    :param df: pandas.Dataframe
    :returns: Dictionary, List
    """
    data = df.to_dict(orient='split')

    results = {
        'cols': [],
        'rows': []
    }

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

    return results, data['columns']


def string_to_date(format='%Y-%m-%d'):
    def convert(d_input):
        return datetime.strptime(d_input, format) if d_input else None
    return convert


def validate_period(val):
    if val.lower() in ('month', 'year'):
        return val.lower()


def validate_format(val):
    if val.lower() in ('keyed'):
        return val.lower()


def get_period_field(period, model):
    """
    Returns the SQL Alchemy field to use base on the type
    aggregate it is (month vs. year)

    :param args: Dictionary
    :return: SQLAlchemy Field object
    """
    fields = []

    fields.append(func.date_part('year', model.date))

    if period == 'month':
        fields.append(
            func.lpad(
                expression.cast(
                    func.date_part('month', model.date), types.String
                ), 3, '-0'
            )
        )
    else:
        fields.append('-01')

    fields.append('-01')

    return func.concat(*fields).label('date')


def add_all_count(df):
    """
    Add a count field for all columns that don't equal 'date'

    :param df: pandas.DataFrame
    :return: pandas.DataFrame
    """
    for col in df.columns:
        if col != 'date':
            if not hasattr(df, 'All'):
                df.insert(1, 'All', 0)
                df['All'] = df[col]
            else:
                df['All'] = df['All'] + df[col]

    return df
