#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3
REGION=$4

echo "publish_ecr paramters"
echo $STAGE
echo $TAG
echo $LABEL
echo $REGION
aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
node ./scripts/prune_ecr_images.js --repoName $REPO_NAME --region $REGION --public true

docker tag $LABEL $ECR_URL/$REPO_NAME:$TAG
docker tag $LABEL $ECR_URL/$REPO_NAME:latest_$STAGE
docker push $ECR_URL/$REPO_NAME:$TAG
docker push $ECR_URL/$REPO_NAME:latest_$STAGE
