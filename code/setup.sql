/*
Dataset Description:
    Monthly listings of cases, recipients, adults, children and expenditures in the Family Assistance and Safety Net Assistance Programs.
    This non-normalized dataset has 46 attributes and around 13,600 data points.
    Dataset Owner – NY Open Data
    https://data.ny.gov/Human-Services/Public-Assistance-PA-Caseloads-and-Expenditures-Be/42wv-qbv6
*/

-- Creating database for the dataset / project
DROP DATABASE IF EXISTS govt_asst_prg_db;
CREATE DATABASE govt_asst_prg_db;

-- Creating a new user with complete access to the above database.
DROP USER IF EXISTS govt_asst_prg_admin;
CREATE USER govt_asst_prg_admin WITH PASSWORD 'govt_asst_prg';

GRANT ALL PRIVILEGES ON DATABASE govt_asst_prg_db TO govt_asst_prg_admin;

ALTER DATABASE govt_asst_prg_db OWNER TO govt_asst_prg_admin;

ALTER USER govt_asst_prg_admin WITH SUPERUSER;
