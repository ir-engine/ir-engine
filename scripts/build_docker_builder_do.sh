#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3
REGION=$4
PRIVATE_ECR=$5
$DOCR_REGISTRY=$6
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

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
if [ $PRIVATE_ECR == "true" ]
then
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-builder --region $REGION --service builder --releaseName $STAGE
else
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-builder --region us-east-1 --service builder --releaseName $STAGE --public
fi

# cache links to use once ECR supports cache manifests
#  --cache-to type=registry,ref=$ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache,mode=max \
#  --cache-from $ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache \