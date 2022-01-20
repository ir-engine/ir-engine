#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

docker tag ${LABEL}-analytics ${LABEL}-analytics:${TAG}
docker tag ${LABEL}-api ${LABEL}-api:${TAG}
docker tag ${LABEL}-client ${LABEL}-client:${TAG}
docker tag ${LABEL}-gameserver ${LABEL}-gameserver:${TAG}
docker tag ${LABEL}-testbot ${LABEL}-testbot:${TAG}
docker push ${LABEL}-analytics:${TAG}
docker push ${LABEL}-api:${TAG}
docker push ${LABEL}-client:${TAG}
docker push ${LABEL}-gameserver:${TAG}
docker push ${LABEL}-testbot:${TAG}