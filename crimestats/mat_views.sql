SELECT
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type, neighborhood, police_precinct,
    count(*)
INTO TABLE
    incident_counts
FROM
    portland_crime_stats
GROUP BY
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type, neighborhood, police_precinct
ORDER BY
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type, neighborhood, police_precinct


SELECT major_offense_type,
 array_agg(ROW(date, count))
 AS monthly_count
FROM major_offense_type_by_year_month


select * from incident_counts;

