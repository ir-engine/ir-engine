#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2

docker build --tag xrchat/client .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag xrchat/client xrchat/client:${STAGE}
docker push xrchat/client:${STAGE}

docker tag xrchat/client xrchat/client:${TAG}
docker push xrchat/client:${TAG}
