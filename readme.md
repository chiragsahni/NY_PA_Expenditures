# New York Public Assistance Cses

Our project focuses on the data exploration for Public Assistance (PA) Caseloads and Expenditures from 2002 to till date for the state of New York.
These data are monthly listings of cases, recipients and expenditures in the categories of various Assistance Programs.
We also included a supplement dataset to fulfill the graduate requirement and this supplement dataset provides the number of PA case openings in each month for each Local Social Services District (SSD).

## Data

Main Dataset: Public Assistance Caseloads and Expenditures
1. 46 attributes and around 13,600 data points
2. https://data.ny.gov/Human-Services/Public-Assistance-PA-Caseloads-and-Expenditures-Be/42wv-qbv6

Supplement Dataset: Public Assistance Cases Opened by Month
1. 8 attributes and around 10,700 data points
2. https://data.ny.gov/Human-Services/Public-Assistance-Cases-Opened-by-Month-Beginning-/fivj-j6mz

Both the datasets used are open datasets i.e. they are publicly available and are owned by NY Open Data organization.

## Build

1. Install NodeJS on the system for hosting the application.
Visit https://nodejs.org/en/download/
2. Navigate to the project folder 'final-project-code'
3. `pip install -r requirements.txt`

## Run

We have prepared a bash script 'application.sh' which takes care of our below mentioned steps. The bash script internally executes the python script 'load_data.py' which takes care of  steps 2,3,4.
1. Postgres database setup
2. Creates table schemas in Postgres
3. Loads data in Postgres
4. Loads supplement data in MongoDB (Mongo Atlas)

How to execute the bash script?
1. `cd code`
2. `bash application.sh`

When the bash script executes successfully, then at the end it deploys the NodeJS application on the localhost. The bash script execution can be considered successful if you see the below two logs.

### NOTE: Sometimes the NodeJS application takes time to get deployed, so please wait until you see both the statements written below.

1. "Listening on port 3002"
2. "Connected NodeJS to Mongo Database!!"

Once you see these two logs, please visit the below link to open the application in you web browser (preferrably Google Chrome and Safari).

Application Link: `http://localhost:3002`