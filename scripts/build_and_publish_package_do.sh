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
DOCR_REGISTRY=$9

doctl registry login --expiry-seconds 1800

#echo "PRUNED"
#docker buildx version
#
docker context create etherealengine-$PACKAGE
docker buildx create --driver=docker-container etherealengine-$PACKAGE --name etherealengine-$PACKAGE --driver-opt "image=moby/buildkit:v0.12.0"

BUILD_START_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Starting ${PACKAGE} build at ${BUILD_START_TIME}"
if [ $PUBLISH_DOCKERHUB == 'true' ] && [ "$DOCKERFILE" != "client-serve-static" ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

  docker buildx build \
    --builder etherealengine-$PACKAGE \
    --load \
    -t $DOCR_REGISTRY/$REPO_NAME-$PACKAGE:${TAG}__${START_TIME} \
    -t $DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_$STAGE \
    -t ${LABEL}-$PACKAGE:${TAG} \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-from type=registry,ref=$DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_${STAGE}_cache \
    --build-arg ECR_URL=$DOCR_REGISTRY \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CLOUDFRONT_DOMAIN=$STORAGE_CLOUDFRONT_DOMAIN \
    --build-arg STORAGE_CLOUDFRONT_DISTRIBUTION_ID=$STORAGE_CLOUDFRONT_DISTRIBUTION_ID \
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
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
    --build-arg VITE_AVATURN_URL=$VITE_AVATURN_URL \
    --build-arg VITE_AVATURN_API=$VITE_AVATURN_API .
  docker push --all-tags $DOCR_REGISTRY/$REPO_NAME-$PACKAGE
  docker push ${LABEL}-$PACKAGE:${TAG}
elif [ "$DOCKERFILE" == "client-serve-static" ]
then
  docker buildx build \
    --builder etherealengine-$PACKAGE \
    --load \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-from type=registry,ref=$DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_${STAGE}_cache \
    --build-arg ECR_URL=$DOCR_REGISTRY \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CLOUDFRONT_DOMAIN=$STORAGE_CLOUDFRONT_DOMAIN \
    --build-arg STORAGE_CLOUDFRONT_DISTRIBUTION_ID=$STORAGE_CLOUDFRONT_DISTRIBUTION_ID \
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
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
    --build-arg VITE_AVATURN_URL=$VITE_AVATURN_URL \
    --build-arg VITE_AVATURN_API=$VITE_AVATURN_API .
else
  docker buildx build \
    --builder etherealengine-$PACKAGE \
    --load \
    -t $DOCR_REGISTRY/$REPO_NAME-$PACKAGE:${TAG}__${START_TIME} \
    -t $DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_$STAGE \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-from type=registry,ref=$DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_${STAGE}_cache \
    --build-arg ECR_URL=$DOCR_REGISTRY \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CLOUDFRONT_DOMAIN=$STORAGE_CLOUDFRONT_DOMAIN \
    --build-arg STORAGE_CLOUDFRONT_DISTRIBUTION_ID=$STORAGE_CLOUDFRONT_DISTRIBUTION_ID \
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
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
    --build-arg VITE_AVATURN_URL=$VITE_AVATURN_URL \
    --build-arg VITE_AVATURN_API=$VITE_AVATURN_API .
  docker push --all-tags $DOCR_REGISTRY/$REPO_NAME-$PACKAGE
fi

# Add this back to buildx build commands once DO fixes their 413 errors, as cache pushes are also triggering them.
#     --cache-to type=registry,mode=max,image-manifest=true,ref=$DOCR_REGISTRY/$REPO_NAME-$PACKAGE:latest_${STAGE}_cache \

# The following scripts will need to be updated for DOCR but are not critical for the functionality of EE on DO.
# if [ $PRIVATE_ECR == "true" ]
# then
#   node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-$PACKAGE --region $REGION --service $PACKAGE --releaseName $STAGE
# else
#   node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-$PACKAGE --region us-east-1 --service $PACKAGE --releaseName $STAGE --public
# fi

BUILD_END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "${PACKAGE} build started at ${BUILD_START_TIME}, ended at ${BUILD_END_TIME}"