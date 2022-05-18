#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2


if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker tag ${LABEL} ${LABEL}-builder:${TAG}
  docker push ${LABEL}-builder:${TAG}
fi