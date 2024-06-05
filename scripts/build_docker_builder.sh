#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
REGION=$3
PRIVATE_REPO=$4
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

docker buildx create --use --driver=docker-container

if [ $REPO_PROVIDER == "aws" ]
then
  if [ $PRIVATE_REPO == "true" ]
  then
    aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $REPO_URL
    aws ecr describe-repositories --repository-names $REPO_NAME-builder --region $REGION || aws ecr create-repository --repository-name $REPO_NAME-builder --region $REGION
    aws ecr describe-repositories --repository-names $REPO_NAME-root --region $REGION || aws ecr create-repository --repository-name $REPO_NAME-root --region $REGION
  else
    aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $REPO_URL
    aws ecr-public describe-repositories --repository-names $REPO_NAME-builder --region us-east-1 || aws ecr-public create-repository --repository-name $REPO_NAME-builder --region us-east-1
    aws ecr-public describe-repositories --repository-names $REPO_NAME-root --region us-east-1 || aws ecr-public create-repository --repository-name $REPO_NAME-root --region us-east-1
  fi
else
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
fi

docker buildx build \
  --push \
  --cache-to type=registry,mode=max,image-manifest=true,ref=$REPO_URL/$REPO_NAME-root:latest_${STAGE}_cache \
  --cache-from type=registry,ref=$REPO_URL/$REPO_NAME-root:latest_${STAGE}_cache \
  --build-arg NODE_ENV=$NODE_ENV \
  -t $REPO_URL/$REPO_NAME-root:latest_$STAGE \
  -t $REPO_URL/$REPO_NAME-root:${EEVERSION}_${TAG} \
  -f dockerfiles/root/Dockerfile-root .

docker buildx build \
  --push \
  --cache-to type=gha,mode=max \
  --cache-from type=gha \
  --build-arg REPO_URL=$REPO_URL \
  --build-arg REPO_NAME=$REPO_NAME \
  --build-arg STAGE=$STAGE \
  -t $REPO_URL/$REPO_NAME-builder:latest_$STAGE \
  -t $REPO_URL/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
  -f dockerfiles/builder/Dockerfile-builder .

if [ $REPO_PROVIDER === "aws" ]
then
  if [ $PRIVATE_REPO == "true" ]
  then
    npx ts-node ./scripts/prune_ecr_images.ts --repoName $REPO_NAME-builder --region $REGION --service builder --releaseName $STAGE
  else
    npx ts-node ./scripts/prune_ecr_images.ts --repoName $REPO_NAME-builder --region us-east-1 --service builder --releaseName $STAGE --public
  fi
fi