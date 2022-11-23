#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2
EEVERSION=$(jq -r .version ./packages/server-core/package.json)


if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  docker tag ${LABEL} ${LABEL}-builder:"${EEVERSION}_${TAG}"
  docker push ${LABEL}-builder:"${EEVERSION}_${TAG}"
fi