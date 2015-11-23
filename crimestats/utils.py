import datetime

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
