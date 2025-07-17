#!/bin/bash

# Load environment variables from .env.local
if [ -f "../../.env.local" ]; then
    export $(grep -v '^#' ../../.env.local | xargs)
elif [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
else
    echo "Warning: .env.local file not found. Using default values."
fi

# MySQL username and password (use environment variables or defaults)
DB_USER="${MYSQL_USER:-server}"
DB_PASSWORD="${MYSQL_PASSWORD:-password}"
DB_HOST="${MYSQL_HOST:-127.0.0.1}"
DB_PORT="${MYSQL_PORT:-3306}"

# Database name to drop
DB_NAME="${MYSQL_DATABASE:-ir-engine}"

# Change to the "packages/server-core" directory
cd packages/server-core

# Run MySQL and provide the password
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" <<EOF

# Drop the database
DROP DATABASE IF EXISTS $DB_NAME;

# Exit from the MySQL shell
EOF

# PostgreSQL username and password (use environment variables or defaults)
PGUSER="${POSTGRES_USER:-postgres}"
PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"
PGHOST="${POSTGRES_HOST:-127.0.0.1}"
PGPORT="${POSTGRES_PORT:-5431}"

# Database name to drop
PGDB="${POSTGRES_DATABASE:-vector-db}"

# Change to the "packages/server-core" directory
cd packages/server-core

# Set the PostgreSQL password environment variable
export PGPASSWORD

# Run PostgreSQL and provide the password
psql -h "$PGHOST" -U "$PGUSER" -p "$PGPORT" <<EOF

# Drop the database
DROP DATABASE IF EXISTS $PGDB;

# Exit from the PostgreSQL shell
EOF

