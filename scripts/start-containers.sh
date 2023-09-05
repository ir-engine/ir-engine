#!/usr/bin/env bash

if which docker > /dev/null 2>&1
then
    if which docker-compose > /dev/null 2>&1
    then
        echo "✅ Docker & Docker-Compose Detected:"
        echo -e "\e[32m💾 Initializing docker containers..."

        export COMPOSE_IGNORE_ORPHANS=true

        docker-compose up -d
        if [[ -z "${IS_LOCAL_FS}" || "${IS_LOCAL_FS}" == 'false' ]]; then
            docker-compose -f docker-compose-minio.yml up -d
        fi
    else
        echo "❌ Please install docker-compose..."
    fi
else
    echo "❌ Please install docker..."
fi
