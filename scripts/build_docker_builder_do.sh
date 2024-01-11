#!/bin/bash
set -e
set -x

STAGE="dig"
TAG="dig-do-5.4.5"
LABEL="etherealengine/etherealengine"
DOCR_REGISTRY="registry.digitalocean.com/etherealengine"
REPO_NAME="etherealengine"
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

echo "Entering the script"

doctl registry login

if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

  docker build \
    --cache-from type=gha \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:latest_$STAGE \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -t ${LABEL}-builder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
  docker push
    $DOCR_REGISTRY/$REPO_NAME-builder:latest_$STAGE \
    $DOCR_REGISTRY/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    ${LABEL}-builder:"${EEVERSION}_${TAG}"
else
  docker build \
    --cache-from type=gha \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:latest_$STAGE \
    -t $DOCR_REGISTRY/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
  docker push --all-tags $DOCR_REGISTRY/$REPO_NAME-builder
fi

# The following scripts will need to be updated for DOCR but are not critical for the functionality of EE on DO.


# cache links to use once ECR supports cache manifests
#  --cache-to type=registry,ref=$ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache,mode=max \
#  --cache-from $ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache \