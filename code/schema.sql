-- Table to store user login info and the corresponding roles
DROP TABLE IF EXISTS user_info;
CREATE TABLE IF NOT EXISTS user_info (
    userid VARCHAR(15),
    user_role VARCHAR(15),
    PRIMARY KEY (userid)
);


-- Table to store user activity
DROP TABLE IF EXISTS user_data_log;
CREATE TABLE IF NOT EXISTS user_data_log (
    userid VARCHAR(15),
    dbname VARCHAR(31),
    table_name VARCHAR(31),
    district_name VARCHAR(15),
    year INT,
    month_name VARCHAR(15),
    asst_category VARCHAR(31),
    access_time_utc TIMESTAMP
);


-- Lookup table consisting of month codes and corresponding month names
DROP TABLE IF EXISTS month_lookup;
CREATE TABLE IF NOT EXISTS month_lookup (
    month_code INT PRIMARY KEY,
    month_name VARCHAR(15)
);


-- Lookup table consisting of district codes and corresponding district names
DROP TABLE IF EXISTS district_lookup;
CREATE TABLE IF NOT EXISTS district_lookup (
    district_code INT PRIMARY KEY,
    district_name VARCHAR(15)
);


DROP TABLE IF EXISTS public_asst_expenditures;
CREATE TABLE IF NOT EXISTS public_asst_expenditures (
    year INT,
    month_code INT,
    district_code INT,
    number_of_cases INT,
    total_recipients INT,
    children_recipients INT,
    adult_recipients INT,
    total_expenditure BIGINT,
    asst_category VARCHAR(31),
    PRIMARY KEY (year, month_code, district_code, asst_category),
    CONSTRAINT month_check CHECK (month_code > 0 AND month_code < 13),
    CONSTRAINT district_check CHECK (district_code > 0 AND district_code < 67)
);