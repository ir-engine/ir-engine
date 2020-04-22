#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2

docker build --tag xrchat/server .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag xrchat/server xrchat/server:${STAGE}
docker push xrchat/server:${STAGE}

docker tag xrchat/server xrchat/server:${TAG}
docker push xrchat/server:${TAG}
