#! /bin/bash

TMP_DIR='.tmp'
FTP_URL='ftp://ftp02.portlandoregon.gov/CivicApps/'
FIRST_YEAR='2004'
YEARS=$(echo 200{4..9} 201{0..4})
FILE_NAME='crime_incident_data_'
FILE_EXTENSION='.zip'
CSV_FILE_NAME='crime_incident_data.csv'
QUOTE_CHAR='"'
DELIMITER=','

DB_TABLE='portland_crime_stats'
DB_USER='travishathaway'
DB_NAME='crimestats2'

# Make the tmp dir, that's where the files go
mkdir -p "$TMP_DIR" && cd "$TMP_DIR"

# Download all the files we need
for year in $YEARS ; 
do
    echo "$FTP_URL""$FILE_NAME""$year""$FILE_EXTENSION"
    curl -O "$FTP_URL""$FILE_NAME""$year""$FILE_EXTENSION"
done

# Unzip all the files
for file in $(ls *.zip);
do
    unzip "$file"
    mv "$CSV_FILE_NAME" $(echo "$file" | sed -e 's/.zip/.csv/')
    rm "$file"
done

first_csv_file=$(ls *.csv | head -n 1)
right_head=$(head -n 1 "$first_csv_file" | perl -p -e 'tr/A-Z, /a-z,_/')

echo "DROP TABLE $DB_TABLE" | psql $DB_NAME -U $DB_USER

for year in $YEARS;
do
    echo "Processing year $year..."
    csv_file="$FILE_NAME""$year".csv

    # Lower case the first row of CSV headers, because that's how 
    # I likes em'
    sed -e "1s/.*/$right_head/" -i '' $csv_file

    if [ $FIRST_YEAR == $year ]
    then
        head -n 500 "$FILE_NAME$year.csv" > short_file.csv
        # Okay, so here where shit gets a little tricky. csvsql is pretty slow, so we 
        # only use it to create our table. That's what it's good at
        csvsql --db postgresql://$DB_USER@localhost/$DB_NAME \
            --table portland_crime_stats \
            --no-constraints \
            --insert short_file.csv

        rm short_file.csv

        # Now we're going to delete the only row that was in that table, we only used 
        # it to get the schema definitions
        echo "TRUNCATE $DB_TABLE" | psql $DB_NAME -U $DB_USER

        echo "ALTER TABLE $DB_TABLE ALTER COLUMN police_district TYPE varchar(10)" | psql $DB_NAME -U $DB_USER

        # Finally, let's try to copy it directly in.
        echo "COPY $DB_TABLE FROM '$(pwd)/$csv_file' 
            DELIMITER '$DELIMITER' QUOTE '$QUOTE_CHAR' FORCE NULL x_coordinate,y_coordinate CSV HEADER " | \
            psql $DB_NAME -U $DB_USER
    else
    #     csvsql --db postgresql://$DB_USER@localhost/$DB_NAME\
    #         --table portland_crime_stats \
    #         --no-constraints \
    #         --no-create \
    #         --insert "$FILE_NAME""$year".csv
        echo "COPY $DB_TABLE FROM '$(pwd)/$csv_file' 
            DELIMITER '$DELIMITER' QUOTE '$QUOTE_CHAR' FORCE NULL x_coordinate,y_coordinate CSV HEADER " | \
            psql $DB_NAME -U $DB_USER
    fi
done

# Clean up after ourselves
rm -rf "$TMP_DIR"

# Get us back to where we belong
cd -

