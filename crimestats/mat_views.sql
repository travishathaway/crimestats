CREATE MATERIALIZED VIEW major_offense_type_by_year_month AS
SELECT
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type, 
    count(*)
FROM
    portland_crime_stats
GROUP BY
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type
ORDER BY
    date(date_part('year', report_date) || '/' || lpad(date_part('month', report_date)::varchar(2), 2, '0') || '/01'),
    major_offense_type;


SELECT major_offense_type,
 array_agg(ROW(date, count))
 AS monthly_count
FROM major_offense_type_by_year_month
