#!/bin/bash
set -e
set -x

# I added DOCKER_HUB_PASSWORD as a secret on Github repo

TAG=$1

echo "$TAG"


docker build --tag xrchat/client .
echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Comment until everything works ok.
# docker tag xrchat/client xrchat/client:latest
# docker push xrchat/client:latest

docker tag xrchat/client xrchat/client:${TAG}
docker push xrchat/client:${TAG}