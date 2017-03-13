#! /bin/bash
#
# Author: Travis Hathaway
#
# Description:
#   This is a script that will import csv data from gathered from
#   the chicago crime reports stream. More info here:
#       https://data.cityofchicago.org/Public-Safety/Crimes-2001-to-present/ijzp-q8t2/data
#
# Usage:
#   After editing the DB_* variables in the script, run the following:
#       ./import_chicago_data.sh <csv_file>
#
# Disclaimer:
#   Travis' scripts should be run for entertainment only, not for 
#   investment purposes.
#

CSV_FILE="$1"
QUOTE_CHAR='"'
DELIMITER=','

DB_TABLE='chicago_crime_stats'
DB_USER='travishathaway'
DB_NAME='crimestats2'

echo "DROP TABLE IF EXISTS $DB_TABLE" | psql $DB_NAME -U $DB_USER

# Lower case the first row of CSV headers. This affects the column
# names in the database
right_head=$(head -n 1 "$CSV_FILE" | perl -p -e 'tr/A-Z, /a-z,_/')
sed -e "1s/.*/$right_head/" -i '' $CSV_FILE

####################
# Create the table #
####################
head -n 500 "$CSV_FILE" > short_file.csv
# Okay, so here where stuff gets a little tricky. csvsql is pretty slow, so we 
# only use it to create our table. That's what it's good at
csvsql --db postgresql://$DB_USER@localhost/$DB_NAME \
    --table $DB_TABLE \
    --no-constraints \
    --insert short_file.csv

rm short_file.csv

###################
# Import the data #
###################

# Now we delete the rows we used to initially populate the table
echo "TRUNCATE $DB_TABLE" | psql $DB_NAME -U $DB_USER

# Finally, copy it directly in.
echo "COPY $DB_TABLE FROM '$(pwd)/$CSV_FILE' 
    DELIMITER '$DELIMITER' QUOTE '$QUOTE_CHAR' FORCE NULL x_coordinate,y_coordinate CSV HEADER " | \
    psql $DB_NAME -U $DB_USER
