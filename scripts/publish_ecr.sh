#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

#If publish_dockerhub.sh is removed, or this script is made to run before it,
#uncomment the docker build line; the current setup assumes that the Docker
#image has already been built
#docker build --tag ${LABEL} .
aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL

docker tag $LABEL $ECR_URL/$REPO_NAME:$TAG
docker push $ECR_URL/$REPO_NAME:$TAG
