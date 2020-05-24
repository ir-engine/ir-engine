#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2

docker build --tag xrengine/client .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag xrengine/client xrengine/client:${STAGE}
docker push xrengine/client:${STAGE}

docker tag xrengine/client xrengine/client:${TAG}
docker push xrengine/client:${TAG}