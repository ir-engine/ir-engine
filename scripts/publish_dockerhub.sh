#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag $LABEL_client $LABEL:$TAG_client
docker tag $LABEL_gameserver $LABEL:$TAG_gameserver
docker tag $LABEL_server $LABEL:$TAG_server
docker push $LABEL:$TAG_client
docker push $LABEL:$TAG_gameserver
docker push $LABEL:$TAG_server