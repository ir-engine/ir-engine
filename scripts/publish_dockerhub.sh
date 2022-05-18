#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag ${LABEL} ${LABEL}:${TAG}
docker push ${LABEL}:${TAG}