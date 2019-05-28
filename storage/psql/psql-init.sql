CREATE TABLE IF NOT EXISTS genres (
    id bigint,
    name text
);
CREATE TABLE IF NOT EXISTS podcasts (
    itunesid bigint NOT NULL,
    feeddown boolean,
    title text,
    authorname text,
    feedurl text,
    releasedate timestamp with time zone,
    lastupdate timestamp with time zone,
    genreids bigint[],
    country text,
    trackcount bigint,
    hostingvendors text[]
);

DROP TABLE podcasts_temp;
CREATE TABLE podcasts_temp AS (SELECT * FROM podcasts);
TRUNCATE TABLE podcasts_temp;
COPY podcasts_temp(itunesid) FROM '/docker-entrypoint-initdb.d/ids.csv' DELIMITER ',' CSV HEADER;

INSERT INTO podcasts
SELECT itunesid FROM podcasts_temp 
WHERE (
    NOT EXISTS (
        SELECT itunesid FROM podcasts 
        WHERE podcasts.itunesid=podcasts_temp.itunesid
    )
);
DROP TABLE podcasts_temp;

