# New York Public Assistance Cses

This web application focuses on the data exploration for Public Assistance (PA) Caseloads and Expenditures from 2002 to till date for the state of New York.
These data are monthly listings of cases, recipients and expenditures in the categories of various Assistance Programs.
I also included a supplement dataset which provides the number of PA case openings in each month for each Local Social Services District (SSD).

GitHub Repository - https://github.com/chiragsahni/NY_PA_Expenditures

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

2. After installation make sure that /usr/local/bin is in your $PATH.
3. Navigate to the project folder 'final-project-code'
4. The application dataloading part is developed in Python3 langauage. So, install the required Python libraries:

    `pip install -r requirements.txt`

## Run

I have prepared a bash script `application.sh` which takes care of all the setup stuff:

1. Executes `setup.sql` file for setting up Postgres database using Postgres user. It creates the required Postgres database and the user.

2. Executes the `load_data.py` file for creating the required table schemas in Postgres, followed by fetching the data and inserting it in Postgres. It also fetches and adds the supplement dataset in MongoDB (Mongo Atlas).

3. Navigates to the `prg_asst_db` folder.

4. Install all the required node modules.

5. Deploys the node application on port 3002.

#### How to execute the bash script?
1. `cd code`
2. `bash application.sh`

The bash script execution can be considered successful if you see the below two logs.

#### NOTE: Sometimes the NodeJS application takes time to get deployed, so please wait until you see both the statements written below.

1. `Listening on port 3002`
2. `Connected NodeJS to Mongo Database!!`

Once you see these two logs, please visit the below link to open and use the application in you web browser (preferrably Google Chrome and Safari).

Enjoy the Application on Link: `http://localhost:3002`

## Using the Application

1. Once you visit the above link, you land on the login page where you need to put in the username. The username entered is stored in the database in the `user_info` table and is also used to store all the details about the user's activity in the `user_data_log` table.

2. After logging in, the user is taken to the home page of the application where they can explore the dataset by filtering data on the basis of the following four paramaeters:

        a. District Name: Text input field which works on the basis of wildcard expression matching. Also, provides an option to explore a list of district names using an adjacent button.

        b. Assistance Category: Dropdown menu containing options of the available assistance categories.

        c. Year: Number input field which takes input between 2002 and 2021 which is the range of available data.

        d. Month: Dropdown menu containing the list of months.

#### 3. It is not necessary to provide input for any of the above fields. If the input for any field is given by the user, the corresponding filter is applied while fetching the dataset.


    4. After the user hits the `Submit` button, the following three tables are populated to give information about:

        a. Number of Zero, Non-Zero and Toal Rows

        b. Maximum and Minimum expenditure rows. It also gives you the Sum and Average of the total expenditures fetched.

        c. Table consisting of top 100 records from the fetched dataset. One of the columns in this table is fetched from the supplement dataset stored in MongoDB.

The user can explore for multiple combinations of the parameters without refreshing the application.
