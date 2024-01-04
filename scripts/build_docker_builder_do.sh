#!/bin/bash
set -e
set -x

STAGE="dig"
TAG="dig-do-3.3.3"
LABEL="etherealengine/etherealengine"
DOCR_REGISTRY="registry.digitalocean.com/etherealengine"
REPO_NAME="etherealengine"
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

echo "Entering the script"
docker buildx create --use --driver=docker-container

doctl registry login --expiry-seconds 1800

if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

  docker buildx build \
    --push \
    --cache-to type=gha,mode=max \
    --cache-from type=gha \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:latest_$STAGE \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -t ${LABEL}-builder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
else
  docker buildx build \
    --push \
    --cache-to type=gha,mode=max \
    --cache-from type=gha \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:latest_$STAGE \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
fi

# The following scripts will need to be updated for DOCR but are not critical for the functionality of EE on DO.


# cache links to use once ECR supports cache manifests
#  --cache-to type=registry,ref=$ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache,mode=max \
#  --cache-from $ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache \