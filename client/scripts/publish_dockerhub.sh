#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3

docker build --tag ${LABEL} .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag ${LABEL} ${LABEL}:${STAGE}
docker push ${LABEL}:${STAGE}

docker tag ${LABEL} ${LABEL}:${TAG}
docker push ${LABEL}:${TAG}
