#!/bin/bash
set -e
set -x

STAGE=$1
LABEL=$2
PACKAGE=$3
DOCKERFILE=$4
START_TIME=$5
REGION=$6
NODE_ENV=$7
PRIVATE_ECR=$8

if [ $PRIVATE_ECR == "true" ]
then
  aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $ECR_URL
  aws ecr describe-repositories --repository-names $REPO_NAME-$PACKAGE --region $REGION || aws ecr create-repository --repository-name $REPO_NAME-$PACKAGE --region $REGION
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-$PACKAGE --region $REGION
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
  aws ecr-public describe-repositories --repository-names $REPO_NAME-$PACKAGE --region us-east-1 || aws ecr-public create-repository --repository-name $REPO_NAME-$PACKAGE --region us-east-1
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-$PACKAGE --region us-east-1 --public
fi

#echo "PRUNED"
#docker buildx version
#
docker context create etherealengine-$PACKAGE
docker buildx create --driver=docker-container etherealengine-$PACKAGE --name etherealengine-$PACKAGE --driver-opt "image=moby/buildkit:master"

BUILD_START_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Starting ${PACKAGE} build at ${BUILD_START_TIME}"
if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

  docker buildx build \
    --builder etherealengine-$PACKAGE \
    --push \
    -t $ECR_URL/$REPO_NAME-$PACKAGE:${TAG}__${START_TIME} \
    -t $ECR_URL/$REPO_NAME-$PACKAGE:latest_$STAGE \
    -t ${LABEL}-$PACKAGE:${TAG} \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-to type=s3,mode=max,region=$REGION,bucket="${CACHE_BUCKET_STEM}-${PACKAGE}-cache",name=latest_$STAGE,access_key_id=$STORAGE_AWS_ACCESS_KEY_ID,secret_access_key=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --cache-from type=s3,region=$REGION,bucket="${CACHE_BUCKET_STEM}-${PACKAGE}-cache",name=latest_$STAGE,access_key_id=$STORAGE_AWS_ACCESS_KEY_ID,secret_access_key=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg ECR_URL=$ECR_URL \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CLOUDFRONT_DOMAIN=$STORAGE_CLOUDFRONT_DOMAIN \
    --build-arg STORAGE_S3_STATIC_RESOURCE_BUCKET=$STORAGE_S3_STATIC_RESOURCE_BUCKET \
    --build-arg STORAGE_AWS_ACCESS_KEY_ID=$STORAGE_AWS_ACCESS_KEY_ID \
    --build-arg STORAGE_AWS_ACCESS_KEY_SECRET=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg STORAGE_S3_REGION=$STORAGE_S3_REGION \
    --build-arg STORAGE_S3_AVATAR_DIRECTORY=$STORAGE_S3_AVATAR_DIRECTORY \
    --build-arg SERVE_CLIENT_FROM_STORAGE_PROVIDER=$SERVE_CLIENT_FROM_STORAGE_PROVIDER \
    --build-arg MYSQL_HOST=$MYSQL_HOST \
    --build-arg MYSQL_USER=$MYSQL_USER \
    --build-arg MYSQL_PORT=$MYSQL_PORT \
    --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
    --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
    --build-arg VITE_APP_HOST=$VITE_APP_HOST \
    --build-arg VITE_APP_PORT=$VITE_APP_PORT \
    --build-arg VITE_PWA_ENABLED=$VITE_PWA_ENABLED \
    --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
    --build-arg VITE_SERVER_PORT=$VITE_SERVER_PORT \
    --build-arg VITE_FILE_SERVER=$VITE_FILE_SERVER \
    --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
    --build-arg VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET \
    --build-arg VITE_8TH_WALL=$VITE_8TH_WALL \
    --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST \
    --build-arg VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT \
    --build-arg VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD \
    --build-arg VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL \
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG .
else
  docker buildx build \
    --builder etherealengine-$PACKAGE \
    --push \
    -t $ECR_URL/$REPO_NAME-$PACKAGE:${TAG}__${START_TIME} \
    -t $ECR_URL/$REPO_NAME-$PACKAGE:latest_$STAGE \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-to type=s3,mode=max,region=$REGION,bucket="${CACHE_BUCKET_STEM}-${PACKAGE}-cache",name=latest_$STAGE,access_key_id=$STORAGE_AWS_ACCESS_KEY_ID,secret_access_key=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --cache-from type=s3,region=$REGION,bucket="${CACHE_BUCKET_STEM}-${PACKAGE}-cache",name=latest_$STAGE,access_key_id=$STORAGE_AWS_ACCESS_KEY_ID,secret_access_key=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg ECR_URL=$ECR_URL \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CLOUDFRONT_DOMAIN=$STORAGE_CLOUDFRONT_DOMAIN \
    --build-arg STORAGE_S3_STATIC_RESOURCE_BUCKET=$STORAGE_S3_STATIC_RESOURCE_BUCKET \
    --build-arg STORAGE_AWS_ACCESS_KEY_ID=$STORAGE_AWS_ACCESS_KEY_ID \
    --build-arg STORAGE_AWS_ACCESS_KEY_SECRET=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg STORAGE_S3_REGION=$STORAGE_S3_REGION \
    --build-arg STORAGE_S3_AVATAR_DIRECTORY=$STORAGE_S3_AVATAR_DIRECTORY \
    --build-arg SERVE_CLIENT_FROM_STORAGE_PROVIDER=$SERVE_CLIENT_FROM_STORAGE_PROVIDER \
    --build-arg MYSQL_HOST=$MYSQL_HOST \
    --build-arg MYSQL_USER=$MYSQL_USER \
    --build-arg MYSQL_PORT=$MYSQL_PORT \
    --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
    --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
    --build-arg VITE_APP_HOST=$VITE_APP_HOST \
    --build-arg VITE_APP_PORT=$VITE_APP_PORT \
    --build-arg VITE_PWA_ENABLED=$VITE_PWA_ENABLED \
    --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
    --build-arg VITE_SERVER_PORT=$VITE_SERVER_PORT \
    --build-arg VITE_FILE_SERVER=$VITE_FILE_SERVER \
    --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
    --build-arg VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET \
    --build-arg VITE_8TH_WALL=$VITE_8TH_WALL \
    --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST \
    --build-arg VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT \
    --build-arg VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD \
    --build-arg VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL \
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG .
fi

npx cross-env ts-node --swc scripts/prune_docker_cache.ts --bucket "${CACHE_BUCKET_STEM}-${PACKAGE}-cache" --releaseName $STAGE

BUILD_END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Ending ${PACKAGE} build at ${BUILD_END_TIME}, start time was ${BUILD_START_TIME}"
# cache links to use once ECR supports cache manifests
#  --cache-to type=registry,ref=$ECR_URL/$REPO_NAME-$PACKAGE:latest_$STAGE_cache,mode=max \
#  --cache-from type=registry,ref=$ECR_URL/$REPO_NAME-$PACKAGE:latest_$STAGE_cache