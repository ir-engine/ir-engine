#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3

aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL

docker tag $LABEL_gamesever $ECR_URL/$REPO_NAME:$TAG_gameserver
docker tag $LABEL_gameserver $ECR_URL/$REPO_NAME:latest_$STAGE_gameserver
docker push --all-tags $ECR_URL/$REPO_NAME
