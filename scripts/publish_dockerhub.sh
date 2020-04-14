#!/bin/bash
set -e
set -x

TAG=$1

docker build --tag xrchat/server .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag xrchat/server xrchat/server:latest
docker push xrchat/server:latest

docker tag xrchat/server xrchat/server:${TAG}
docker push xrchat/server:${TAG}