-- Gets the count for a single census block
WITH census_block AS (
    select geom from tri_county_census_tracts where cnty_name = 'Multnomah' limit 1
)
select 
    count(*) 
from 
    portland_crime_stats pcs
where
    ST_Contains((select geom from census_block), pcs.geom)

-- Add the total_crime_count column to the census block table
-- I would to have this aggregated by year as well
ALTER TABLE tri_county_census_tracts add column total_crime_count integer

-- Update all the counties. This takes about 15 minutes to run
UPDATE 
    tri_county_census_tracts tracts
SET
    total_crime_count = (
        SELECT 
            COUNT(*) 
        FROM 
            portland_crime_stats
        WHERE
            ST_Intersects(geom, tracts.geom)
    )   

-- Get the population density for each census block
SELECT 
    name10, pop10 / (
        SELECT 
            SUM(t.pop10) 
        FROM 
            tri_county_census_tracts t
        ) 
FROM
    tri_county_census_tracts;

-- Alters the tri_county table adding a column for 2000 census population
ALTER TABLE tri_county_census_tracts ADD COlUMN pop00 integer;

-- Update the tri_county table to add census population from oregon census 2000 table
UPDATE tri_county_census_tracts AS tri
SET
    pop00 = o.total
FROM
    oregon_2000_pop_by_census_tract AS o
WHERE
    o.id2::varchar = tri.geoid10::varchar

-- Joins the 2000 census table with our tri_county table
SELECT
    tri.cnty_name, o.total, tri.pop10::integer
FROM
    tri_county_census_tracts tri
LEFT JOIN
    oregon_2000_pop_by_census_tract o
ON
    o.id2::varchar = tri.geoid10::varchar
ORDER BY
    tri.cnty_name
