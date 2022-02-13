#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3
PRIVATE_ECR=$4
REGION=$5

if [ $PRIVATE_ECR == "true" ]
then
  aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $ECR_URL
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-analytics --region $REGION
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-api --region $REGION
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-client --region $REGION
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-gameserver --region $REGION
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-testbot --region $REGION
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-analytics --region us-east-1 --public
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-api --region us-east-1 --public
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-client --region us-east-1 --public
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-gameserver --region us-east-1 --public
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-testbot --region us-east-1 --public
fi

docker tag $LABEL-analytics $ECR_URL/$REPO_NAME-analytics:$TAG & docker tag $LABEL-analytics $ECR_URL/$REPO_NAME-analytics:latest_$STAGE & \
  docker tag $LABEL-api $ECR_URL/$REPO_NAME-api:$TAG & docker tag $LABEL-api $ECR_URL/$REPO_NAME-api:latest_$STAGE & \
  docker tag $LABEL-client $ECR_URL/$REPO_NAME-client:$TAG & docker tag $LABEL-client $ECR_URL/$REPO_NAME-client:latest_$STAGE & \
  docker tag $LABEL-gameserver $ECR_URL/$REPO_NAME-gameserver:$TAG & docker tag $LABEL-gameserver $ECR_URL/$REPO_NAME-gameserver:latest_$STAGE & \
  docker tag $LABEL-testbot $ECR_URL/$REPO_NAME-testbot:$TAG & docker tag $LABEL-testbot $ECR_URL/$REPO_NAME-testbot:latest_$STAGE

docker push $ECR_URL/$REPO_NAME-analytics:$TAG & docker push $ECR_URL/$REPO_NAME-api:$TAG & \
  docker push $ECR_URL/$REPO_NAME-client:$TAG & docker push $ECR_URL/$REPO_NAME-gameserver:$TAG & \
  docker push $ECR_URL/$REPO_NAME-testbot:$TAG
docker push $ECR_URL/$REPO_NAME-analytics:latest_$STAGE & docker push $ECR_URL/$REPO_NAME-api:latest_$STAGE & \
  docker push $ECR_URL/$REPO_NAME-client:latest_$STAGE & docker push $ECR_URL/$REPO_NAME-gameserver:latest_$STAGE & \
  docker push $ECR_URL/$REPO_NAME-testbot:latest_$STAGE