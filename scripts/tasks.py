import luigi
import urllib.request
import zipfile
import pandas as pd
from sqlalchemy import create_engine

DSN = 'postgresql://travishathaway@localhost/travishathaway'
TABLE_NAME = 'portland_crime_stats_luigi'

class DownloadCSVs(luigi.Task):

    year = luigi.IntParameter(default=2004)

    def run(self):
        url = 'ftp://ftp02.portlandoregon.gov/CivicApps/crime_incident_data_{}.zip'.format(self.year)
        req = urllib.request.Request(url=url)

        with self.output().open('w') as out_file:
            with urllib.request.urlopen(req) as in_file:
                out_file.write(in_file.read())

    def output(self):
        return luigi.LocalTarget(
            './tmp/crime_stats_{}.zip'.format(self.year),
            format=luigi.format.Nop)


class UnzipFilesCleanCSV(luigi.Task):

    year = luigi.IntParameter(default=2004)

    def requires(self):
        return DownloadCSVs(self.year)

    def output(self):
        return luigi.LocalTarget('./tmp/crime_stats_{}.csv'.format(self.year),
                                 format=luigi.format.Nop)

    def run(self):
        with zipfile.ZipFile(self.input().path, 'r') as z_file:
            with z_file.open('crime_incident_data.csv', 'r') as in_csv_file:
                with self.output().open('w') as out_csv_file:
                    for idx, line in enumerate(in_csv_file.readlines()):
                        if idx == 0:
                            line = line.lower().replace(b' ', b'_')
                        out_csv_file.write(line)


class LoadToPostgres(luigi.Task):

    year = luigi.IntParameter(default=2004)

    def requires(self):
        return UnzipFilesCleanCSV(self.year)

    def run(self):
        df = pd.read_csv(
            self.input().path, dtype={'police_district': str},
            index_col=0
        )
        engine = create_engine(DSN)
        df.to_sql(TABLE_NAME, engine, if_exists='append')
