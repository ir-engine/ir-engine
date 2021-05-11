#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3

aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL

docker tag $LABEL_client $ECR_URL/$REPO_NAME:$TAG_client
docker tag $LABEL_client $ECR_URL/$REPO_NAME:latest_$STAGE_client
docker push --all-tags $ECR_URL/$REPO_NAME
