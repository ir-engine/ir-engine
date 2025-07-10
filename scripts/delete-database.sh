#!/bin/bash

# MySQL username and password
DB_USER="server"
DB_PASSWORD="password"

# Database name to drop
DB_NAME="ir-engine"

# Change to the "packages/server-core" directory
cd packages/server-core

# Run MySQL and provide the password
mysql -h 127.0.0.1 -u "$DB_USER" -p"$DB_PASSWORD" <<EOF

# Drop the database
DROP DATABASE IF EXISTS $DB_NAME;

# Exit from the MySQL shell
EOF

# PostgreSQL username and password
PGUSER="postgres"
PGPASSWORD="postgres"

# PostgreSQL port
PGPORT="5432"

# Database name to drop
PGDB="vector-db"

# Change to the "packages/server-core" directory
cd packages/server-core

# Set the PostgreSQL password environment variable
export PGPASSWORD

# Run PostgreSQL and provide the password
psql -h 127.0.0.1 -U "$PGUSER" -p "$PGPORT" <<EOF

# Drop the database
DROP DATABASE IF EXISTS $PGDB;

# Exit from the PostgreSQL shell
EOF

