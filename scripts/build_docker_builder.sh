#!/bin/bash
set -e
set -x

STAGE=$1
LABEL=$2
PRIVATE_ECR=$3
REGION=$4

echo $PRIVATE_ECR
if [[ $PRIVATE_ECR == "true" ]]
then
  aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $ECR_URL
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
fi

DOCKER_BUILDKIT=1 docker build --cache-from $ECR_URL/$REPO_NAME-builder:latest_$STAGE --build-arg BUILDKIT_INLINE_CACHE=1 --tag $LABEL -f Dockerfile-builder .
