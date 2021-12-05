const express = require("express");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
const app = express();

const { Pool } = require("pg");

// Credentials to connect to Postgres DB
const credentials = {
  user: "govt_asst_prg_admin",
  host: "localhost",
  database: "govt_asst_prg_db",
  password: "govt_asst_prg",
  port: 5432,
};

const mongo_info = {
  database: "program_assistance",
  collection: "opened_cases",
};

app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to Postgres DB
async function poolDemo(queryString) {
  const pool = new Pool(credentials);
  const now = await pool.query(queryString);
  await pool.end();
  return now;
}

app.set("view engine", "ejs");

var db = null;
var logged_user_name = "";
var mongo_connection_string =
  "mongodb+srv://chiragsahni1303:KIInX2yif208pCLu@cluster0.ewwmg.mongodb.net/program_assistance?retryWrites=true&w=majority";
MongoClient.connect(mongo_connection_string, { useUnifiedTopology: true }).then(
  (client) => {
    console.log("Connected NodeJS to Mongo Database!!");
    db = client.db(mongo_info.database);
  }
);

// Rendering user login page
app.get("/", (req, res) => {
  res.render("login.ejs");
});

// Rendering the page containing the list of districts on a new tab
app.get("/districts", (req, res) => {
  res.render("districts.ejs");
});

// Taking user_name as input on click of Submit button
app.post("/home", async (req, res) => {
  logged_user_name = req.body.username;
  const pool = new Pool(credentials);
  // SQL query to store user information
  // Handled SQL injection as the input for user_name is a type-in field
  pool.query({ 
    text: "INSERT INTO user_info VALUES($1,'user') ON CONFLICT (userid) DO NOTHING", 
    values: [`${logged_user_name}`]
 }).then(results => {
  res.render("index.ejs", {
      asst_data: {},
      heading: "",
      record_heading: "",
      max_query_output: {},
      min_query_output: {},
      zero_query_output: {},
      non_zero_query_output: {},
      total_rows_query_output: {},
      sum_avg_query_output: {},
    });
  })
});

// Taking multiple user inputs to fetch program assistance data accordingly on click of Submit button
app.post("/", async (req, res) => {
  // SQL query to fetch data based on user input
  // Handled SQL injection as the input for district_name is a type-in field
  var main_data_fetch_query =
    "SELECT * FROM public_asst_expenditures p INNER JOIN month_lookup m ON p.month_code = m.month_code INNER JOIN district_lookup d ON p.district_code = d.district_code WHERE p.district_code IN (SELECT district_code FROM district_lookup WHERE district_name ILIKE $1)";
  
  // SQL query to store user data log
  // Handled SQL injection as the input for user_name and district_name are type-in fields
  var insert_user_activity_query = `INSERT INTO user_data_log VALUES ($1, 'govt_asst_prg_db', 'public_asst_expenditures', $2`;
  var heading = (req.body.district_name === "") ? "Records" : `Records for ${req.body.district_name}`;

  // Make use of user input for the attribute year
  if (req.body.year === "") {
    main_data_fetch_query = main_data_fetch_query + " AND 1=1";
    insert_user_activity_query = insert_user_activity_query + ", NULL";
  } else {
    main_data_fetch_query = main_data_fetch_query + ` AND year = ${req.body.year}`;
    heading = heading + ` for ${req.body.year}`;
    insert_user_activity_query = insert_user_activity_query + `, ${req.body.year}`;
  }

  // Make use of user input for the attribute month_name
  if (req.body.month_name === "Select") {
    main_data_fetch_query = main_data_fetch_query + " AND 1=1";
    insert_user_activity_query = insert_user_activity_query + ", NULL";
  } else {
    main_data_fetch_query =
      main_data_fetch_query +
      ` AND p.month_code = (SELECT month_code FROM month_lookup WHERE month_name = '${req.body.month_name}')`;
    heading = heading + ` for ${req.body.month_name}`;
    insert_user_activity_query = insert_user_activity_query + `, '${req.body.month_name}'`;
  }

  // Make use of user input for the attribute assistance category type
  if (req.body.asst_category === "Select") {
    main_data_fetch_query = main_data_fetch_query + " AND 1=1";
    insert_user_activity_query = insert_user_activity_query + ", NULL";
  } else {
    main_data_fetch_query = main_data_fetch_query + ` AND asst_category = '${req.body.asst_category}'`;
    heading = heading + ` for ${req.body.asst_category}`;
    insert_user_activity_query = insert_user_activity_query + `, '${req.body.asst_category}'`;
  }

  // Prepare query to Log the User Activity
  main_data_fetch_query = main_data_fetch_query + ` ORDER BY year DESC, p.month_code, district_name`;
  var current_time = new Date();
  insert_user_activity_query =
    insert_user_activity_query + "," + `'${current_time.toUTCString()}'` + ");";

  // Prepare query for finding the row with Maximum Expenditure out of the fetched rows
  var max_begin =
    "SELECT * FROM (SELECT RANK() OVER(ORDER BY total_expenditure DESC) rk, * FROM (";
  var max_end = ") temp1) temp2 WHERE rk = 1;";
  var max_query = max_begin + main_data_fetch_query + max_end;
  var max_query_output = {};

  // Prepare query for finding thw row with Minimum Expenditure out of the fetched rows
  var min_begin =
    "SELECT * FROM (SELECT RANK() OVER(ORDER BY total_expenditure) rk, * FROM (";
  var min_end = ") temp1) temp2 WHERE rk = 1;";
  var min_query = min_begin + main_data_fetch_query + min_end;
  var min_query_output = {};

  // Prepare query for finding the number of rows with Zero Expenditure out of the fetched rows
  var zero_begin = "SELECT COUNT(*) FROM (";
  var zero_end = ") temp1 WHERE total_expenditure = 0;";
  var zero_query = zero_begin + main_data_fetch_query + zero_end;
  var zero_query_output = {};

  // Prepare query for finding number of rows with Non-Zero Expenditure out of the fetched rows
  var non_zero_begin = "SELECT COUNT(*) FROM (";
  var non_zero_end = ") temp1 WHERE total_expenditure != 0;";
  var non_zero_query = non_zero_begin + main_data_fetch_query + non_zero_end;
  var non_zero_query_output = {};

  // Prepare query for finding the Total Number of fetched rows
  var total_rows_begin = "SELECT COUNT(*) FROM (";
  var total_rows_end = ") temp1;";
  var total_rows_query = total_rows_begin + main_data_fetch_query + total_rows_end;
  var total_rows_query_output = {};

  // Prepare query for finding the Sum and Average of Total Expenditure out of the fetched rows
  var sum_avg_begin =
    "SELECT SUM(total_expenditure) AS sum_total_expenditure, AVG(total_expenditure) AS avg_total_expenditure FROM (";
  var sum_avg_end = ") temp1;";
  var sum_avg_query = sum_avg_begin + main_data_fetch_query + sum_avg_end;
  var sum_avg_query_output = {};

  // Execute different queries by handling SQL injection
  const pool = new Pool(credentials);
  await pool.query({
    text: max_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    max_query_output = results.rows;
  });

  await pool.query({
    text: min_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    min_query_output = results.rows;
  });

  await pool.query({
    text: sum_avg_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    sum_avg_query_output = results.rows;
  });

  await pool.query({
    text: zero_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    zero_query_output = results.rows;
  });

  await pool.query({
    text: non_zero_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    non_zero_query_output = results.rows;
  });

  await pool.query({
    text: total_rows_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    total_rows_query_output = results.rows;
  });

  await pool.query({
    text: main_data_fetch_query,
    values: [`%${req.body.district_name}%`]
  }).then(async (results) => {
    // Displaying only top 100 records on the application front end in order to handle them efficiently using HTML
    const top_records = results.rows.slice(0, 100);
    var record_heading = (results.rows.length > 100) ? "Displaying Top 100 Records" : "Displaying All Records"
    
    for (var i = 0; i < top_records.length; i++) {
      mongo_query = {};
      mongo_query["year"] = top_records[i].year.toString();
      mongo_query["month"] = top_records[i].month_name.toString();
      mongo_query["district"] = top_records[i].district_name.toString();
      // Fetching required information from MongoDB collection for all the records
      await db
        .collection(mongo_info.collection)
        .findOne(mongo_query)
        .then((mongo_results) => {
          holder_var =
            mongo_results == null
              ? "Data Not Available"
              : mongo_results["total_openings"];
        })
        .catch((error) => console.error(error));
      top_records[i]["total_openings"] = holder_var;
    }
   
    // Rendering the main page of application 
    res.render("index.ejs", {
      asst_data: top_records,
      heading: heading,
      record_heading: record_heading,
      max_query_output: max_query_output,
      min_query_output: min_query_output,
      zero_query_output: zero_query_output,
      non_zero_query_output: non_zero_query_output,
      total_rows_query_output: total_rows_query_output,
      sum_avg_query_output: sum_avg_query_output,
    });
  })

  await pool.query({
    text: insert_user_activity_query,
    values: [`${logged_user_name}`,`${req.body.district_name}`]
  }).then()
});

app.listen(3002, function () {
  console.log("Listening on port 3002");
});
