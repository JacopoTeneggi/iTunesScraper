CREATE TABLE genres (
    id bigint,
    name text
);
CREATE TABLE podcasts (
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
COPY podcasts(itunesid) FROM '/docker-entrypoint-initdb.d/ids.csv' DELIMITER ',' CSV HEADER;