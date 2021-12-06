import requests, io, pandas as pd, psycopg2, warnings, pymongo
from requests.exceptions import HTTPError
warnings.filterwarnings("ignore")


# Create connection to Postgres
postgresConnection = psycopg2.connect("dbname=govt_asst_prg_db user=govt_asst_prg_admin password='govt_asst_prg'")
cursor = postgresConnection.cursor()


def fetch_data_from_api(api_json_endpoint):
    response = requests.get(api_json_endpoint)
    content = response.content
    data_df = pd.read_csv(io.StringIO(content.decode('utf-8')))
    return data_df


def execute_sql_script_in_postgres(filename):
    fd = open(filename, 'r')
    sqlFile = fd.read()
    fd.close()
    # Execute every command from the input file after splitting on ';'
    sqlCommands = sqlFile.split(';')
    sqlCommands.pop()
    for command in sqlCommands:
        try:
            cursor.execute(command + ';')
        except Exception as err:
            print("ERROR:",err,"!!")
    postgresConnection.commit()


def insert_records_in_postgres(df, table):
    # Create a list of tupples from the dataframe values
    tuples = [tuple(x) for x in df.to_numpy()]
    # Comma-separated dataframe columns
    cols = ','.join(list(df.columns))
    num_cols = len(df.columns) - 1
    # SQL quert to execute
    query = ("INSERT INTO %s(%s) VALUES (%%s" + ',%%s' * num_cols + ')') % (table, cols)
    cursor = postgresConnection.cursor()
    try:
        cursor.executemany(query, tuples)
        postgresConnection.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print("ERROR:",error,"!!")
        postgresConnection.rollback()
        cursor.close()
        return 1
    print(("Insertion successful in %s table") % table)
    cursor.close()


def create_assistance_df(col_list, assistance_category):
    temp_df = data_df.iloc[:,col_list]
    temp_df['asst_category'] = assistance_category
    temp_df.columns = asst_table_cols
    return temp_df


# Fetch main program assistance dataset
api_json_endpoint = "https://data.ny.gov/resource/42wv-qbv6.csv?$limit=20000"
data_df = fetch_data_from_api(api_json_endpoint)
print("Fetched main program assistance data successfully")
data_df = data_df.rename(columns={"month": "month_name", "district": "district_name"}).dropna()


# Prepare data to be inserted in lookup tables in Postgres
filename = "schema.sql"
month_lookup_df = data_df.groupby(['month_code','month_name']).size().reset_index().rename(columns={0:'count'}).drop(columns=['count'])
district_lookup_df = data_df.groupby(['district_code','district_name']).size().reset_index().rename(columns={0:'count'}).drop(columns=['count'])


# Create tables in Postgres using schema in schema_tables.sql file
execute_sql_script_in_postgres(filename)


# Insert data in lookup tables in Postgres
insert_records_in_postgres(month_lookup_df, 'month_lookup')
insert_records_in_postgres(district_lookup_df, 'district_lookup')


# Prepare and insert data in main table in Postgres
# As per the feedback from the professor, the main table is created
# by introducing a new column 'asst_category' from our side which
# gives information about the assistance category.
asst_df = pd.DataFrame()
asst_table_cols = ['year','month_code','district_code','number_of_cases','total_recipients','children_recipients','adult_recipients','total_expenditure','asst_category']
asst_df = asst_df.append(create_assistance_df([0,2,3,10,11,12,13,14], 'family_asst_fed'))
asst_df = asst_df.append(create_assistance_df([0,2,3,15,16,17,18,19], 'safety_net_asst'))
asst_df = asst_df.append(create_assistance_df([0,2,3,26,27,28,29,30], 'safety_net_asst_fed'))
asst_df = asst_df.append(create_assistance_df([0,2,3,31,32,33,34,35], 'safety_net_asst_non_fed'))
asst_df = asst_df.append(create_assistance_df([0,2,3,36,37,38,39,40], 'maintenance_of_effort'))
asst_df = asst_df.append(create_assistance_df([0,2,3,41,42,43,44,45], 'non_maintenance_of_effort'))
insert_records_in_postgres(asst_df, 'public_asst_expenditures')


# Fetch supporting dataset to be stored in MongoDB Atlas
api_endpoint_opened_cases = "https://data.ny.gov/resource/fivj-j6mz.json?$limit=20000"
try:
    response = requests.get(api_endpoint_opened_cases)
    response.raise_for_status()
    jsonResponse = response.json()
    print("Fetched supporting data from MongoDB successfully")
except HTTPError as http_err:
    print("HTTP error occurred:",http_err)
except Exception as err:
    print("Other error occurred:",err)


# Create connection to Mongo Atlas and insert data in required collection
try:
    client = pymongo.MongoClient("mongodb+srv://chiragsahni1303:KIInX2yif208pCLu@cluster0.ewwmg.mongodb.net/program_assistance?retryWrites=true&w=majority")
    print("Connected MongoDB Successfully")
except Exception as err:
    print("ERROR: Could not connect to MongoDB!!")
    print(err)
# Created / Switched database and collection in Mongo
db = client.program_assistance
collection = db.opened_cases
collection.drop()
try:
    x = collection.insert_many(jsonResponse)
    print("Insertion successful in MongoDB collection")
except:
    print("ERROR: Could not insert the data in MongoDB!!")