#!/bin/bash

if which docker > /dev/null 2>&1
then
    if which docker-compose > /dev/null 2>&1; then
        command_to_execute="docker-compose"
    elif docker compose version > /dev/null 2>&1; then
        command_to_execute="docker compose"
    else
        echo "❌ Please install docker-compose or docker compose v2"
        exit 1
    fi

    set -a; source ../.env.local; set +a #load shared .env

    echo "✅ Docker & Docker-Compose Detected:"
    echo -e "\e[32m💾 Initializing docker containers..."

    export COMPOSE_IGNORE_ORPHANS=true

    eval "$command_to_execute up -d"
    if [[ -z "${IS_LOCAL_FS}" || "${IS_LOCAL_FS}" == 'false' ]]; then
        eval "$command_to_execute -f docker-compose-minio.yml up -d"
    fi
else
    echo "❌ Please install docker..."
fi
