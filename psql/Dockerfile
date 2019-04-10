FROM postgres:10.4

ADD ./psql-init.sql /docker-entrypoint-initdb.d/
ADD ./ids.csv /docker-entrypoint-initdb.d/