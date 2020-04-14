#!/bin/bash
set -e
set -x

TAG=$1

docker build --tag xrchat/client .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag xrchat/client xrchat/client:latest
docker push xrchat/client:latest

docker tag xrchat/client xrchat/client:${TAG}
docker push xrchat/client:${TAG}