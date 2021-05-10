#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3

aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
node ./scripts/prune_ecr_images.js --repoName $REPO_NAME

docker tag $LABEL_client $ECR_URL/$REPO_NAME:$TAG_client
docker tag $LABEL_client $ECR_URL/$REPO_NAME:latest_$STAGE_client
docker tag $LABEL_gameserver $ECR_URL/$REPO_NAME:$TAG_gameserver
docker tag $LABEL_gameserver $ECR_URL/$REPO_NAME:latest_$STAGE_gameserver
docker tag $LABEL_server $ECR_URL/$REPO_NAME:$TAG_server
docker tag $LABEL_server $ECR_URL/$REPO_NAME:latest_$STAGE_server
docker push --all-tags $ECR_URL/$REPO_NAME
docker push --all-tags $ECR_URL/$REPO_NAME
docker push --all-tags $ECR_URL/$REPO_NAME
