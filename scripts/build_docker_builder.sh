#!/bin/bash
set -e
set -x

STAGE=$1
LABEL=$2
REGION=$3


aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $ECR_URL

#docker pull $ECR_URL/$REPO_NAME-builder:latest_$STAGE || true
DOCKER_BUILDKIT=1 docker build --cache-from $ECR_URL/$REPO_NAME-builder:latest_$STAGE --build-arg BUILDKIT_INLINE_CACHE=1 --tag $LABEL -f Dockerfile-builder .
