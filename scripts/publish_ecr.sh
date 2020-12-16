#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3

aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
node ./prune_ecr_images.js --repoName $REPO_NAME

docker tag $LABEL $ECR_URL/$REPO_NAME:$TAG
docker tag $LABEL $ECR_URL/$REPO_NAME:latest_$STAGE
docker push $ECR_URL/$REPO_NAME:$TAG
docker push $ECR_URL/$REPO_NAME:latest_$STAGE
