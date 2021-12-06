echo "Starting Bash Script Execution...."
if psql -U postgres postgres < setup.sql; then
    echo "Database Setup Complete"
    if python load_data.py; then
        echo "Datasets Loaded Successfully in Postgres and Mongo"
        cd prg_asst_db
        npm install
        npm run dev
    else
        echo "Exit code of $?, execution of load_data.py failed!!"
    fi
else
    echo "Exit code of $?, execution of setup.sql failed!!"
fi
echo "Bash Script Execution Over"