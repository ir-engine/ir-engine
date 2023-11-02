#!/bin/bash

# MySQL username and password
DB_USER="server"
DB_PASSWORD="password"

# Database name to drop
DB_NAME="etherealengine"

# Change to the "packages/server-core" directory
cd packages/server-core

# Run MySQL and provide the password
mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" <<EOF

# Drop the database
DROP DATABASE IF EXISTS $DB_NAME;

# Exit from the MySQL shell
EOF

