#!/bin/bash
test -f ../.env.local && . ../.env.local

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

    echo "✅ Docker & Docker-Compose Detected:"
    echo -e "\e[32m💾 Initializing docker containers..."

    export COMPOSE_IGNORE_ORPHANS=true

    eval "$command_to_execute -f docker-compose-core.yml up -d"
    if [[ -z "${DC_minio}" || "${DC_minio}" == 'true' ]]; then
        eval "$command_to_execute -f docker-compose-minio.yml up -d"
    fi
    if [[ -z "${DC_test}" || "${DC_test}" == 'true' ]]; then
        eval "$command_to_execute -f docker-compose-test.yml up -d"
    fi
    if [[ -z "${DC_minikube}" || "${DC_minikube}" == 'true' ]]; then
        eval "$command_to_execute -f docker-compose-minikube.yml up -d"
    fi
else
    echo "❌ Please install docker..."
fi
