#!/bin/bash
set -e
set -x

STAGE=$1
PACKAGE=$2
DOCKERFILE=$3
START_TIME=$4
REGION=$5
NODE_ENV=$6
SOURCE_REPO_NAME=$7
DESTINATION_REPO_PROVIDER=$8
DESTINATION_REPO_NAME=$9
PRIVATE_REPO=$10

DESTINATION_REPO_NAME=$DESTINATION_REPO_NAME_STEM-$PACKAGE
SOURCE_REPO_NAME=$SOURCE_REPO_NAME_STEM-root

if [ "$SOURCE_REPO_PROVIDER" == "gcp" ]; then
  # Set default repo name pattern
  SOURCE_REPO_NAME="$SOURCE_REPO_NAME_STEM-root/$SOURCE_REPO_NAME_STEM-root"
  
  # Apply environment-specific suffixes based on APP_HOST
  if [[ "$APP_HOST" =~ "studio" ]] || [[ "$APP_HOST" =~ "mt-stg" ]]; then
    SUFFIX="mt"
  elif [[ "$APP_HOST" =~ "mt-rc" ]]; then
    SUFFIX="mt-rc"
  elif [[ "$APP_HOST" =~ "mt-int" ]]; then
      SUFFIX="mt-int"
  elif [[ "$APP_HOST" =~ "mt-qat" ]]; then
    SUFFIX="mt-qat"
  elif [[ "$APP_HOST" =~ "mt" ]]; then
    SUFFIX="mt"
  elif [[ "$APP_HOST" =~ "qat" ]]; then
    SUFFIX="qat"
  elif [[ "$app_host" =~ "mt-nightly" ]]; then
    suffix="mt-nightly"
  elif [[ "$app_host" =~ "mt-weekly" ]]; then
    suffix="mt-weekly"
  elif [[ "$app_host" =~ "mt-prdmirr" ]]; then
    suffix="mt-prdmirr"
  else
    SUFFIX=""
  fi
  
  # Only modify the repo name if a suffix was identified
  if [ -n "$SUFFIX" ]; then
    SOURCE_REPO_NAME="$SOURCE_REPO_NAME_STEM-root-$SUFFIX/$SOURCE_REPO_NAME_STEM-root"
  fi
fi

if [ "$DESTINATION_REPO_PROVIDER" = "aws" ]; then
  if [ "$PRIVATE_REPO" = "true" ]; then
    aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $DESTINATION_REPO_URL
    aws ecr describe-repositories --repository-names $DESTINATION_REPO_NAME --region $REGION || aws ecr create-repository --repository-name $DESTINATION_REPO_NAME_STEM-$PACKAGE --region $REGION
  else
    aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $DESTINATION_REPO_URL
    aws ecr-public describe-repositories --repository-names $DESTINATION_REPO_NAME --region us-east-1 || aws ecr-public create-repository --repository-name $DESTINATION_REPO_NAME_STEM-$PACKAGE --region us-east-1
  fi
elif [ "$DESTINATION_REPO_PROVIDER" == "gcp" ]; then
  echo "Log into Docker with GCP credentials"
  DESTINATION_REPO_NAME=$DESTINATION_REPO_NAME_STEM-$PACKAGE/$DESTINATION_REPO_NAME_STEM-$PACKAGE

  # Apply environment-specific suffixes based on APP_HOST
  if [[ "$APP_HOST" =~ "studio" ]] || [[ "$APP_HOST" =~ "mt-stg" ]]; then
    SUFFIX="mt"
  elif [[ "$APP_HOST" =~ "mt-rc" ]]; then
    SUFFIX="mt-rc"
  elif [[ "$APP_HOST" =~ "mt-int" ]]; then
      SUFFIX="mt-int"
  elif [[ "$APP_HOST" =~ "mt-qat" ]]; then
      SUFFIX="mt-qat"
  elif [[ "$APP_HOST" =~ "mt" ]]; then
      SUFFIX="mt"
  elif [[ "$APP_HOST" =~ "qat" ]]; then
      SUFFIX="qat"
  else
      SUFFIX=""
  fi
    
  # Only modify the repo name if a suffix was identified
  if [ -n "$SUFFIX" ]; then
      DESTINATION_REPO_NAME="$DESTINATION_REPO_NAME_STEM-$PACKAGE-$SUFFIX/$DESTINATION_REPO_NAME_STEM-$PACKAGE"
  fi    

  gcloud auth configure-docker us-central1-docker.pkg.dev --quiet
  # Insert GCP credentials fetching here, and apply that to docker login
else
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
fi

if ! docker context create ir-engine-$PACKAGE-context; then
    echo "Failed to create context ir-engine-$PACKAGE-context, it may already exist"
fi

if ! docker buildx create --driver-opt network=host --driver=docker-container ir-engine-$PACKAGE-context --name ir-engine-$PACKAGE --driver-opt "image=moby/buildkit:v0.12.0"; then
   echo "Failed to create builder ir-engine-$PACKAGE, it may already exist"
fi

BUILD_START_TIME=$(date +"%d-%m-%yT%H-%M-%S")
echo "Starting ${PACKAGE} build at ${BUILD_START_TIME}"
if [ "$DOCKERFILE" != "client-serve-static" ]; then
  docker buildx build \
    --builder ir-engine-$PACKAGE \
    --push \
    -t $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:${TAG}__${START_TIME} \
    -t $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:latest_$STAGE \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-to type=registry,mode=max,image-manifest=true,ref=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:latest_${STAGE}_cache \
    --cache-from type=registry,ref=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:latest_${STAGE}_cache \
    --build-arg REPO_URL=$SOURCE_REPO_URL \
    --build-arg REPO_NAME=$SOURCE_REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg KUBERNETES=$KUBERNETES \
    --build-arg TAG=$TAG \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CDN_DOMAIN=$STORAGE_CDN_DOMAIN \
    --build-arg STORAGE_CLOUDFRONT_DISTRIBUTION_ID=$STORAGE_CLOUDFRONT_DISTRIBUTION_ID \
    --build-arg STORAGE_STATIC_RESOURCE_BUCKET=$STORAGE_STATIC_RESOURCE_BUCKET \
    --build-arg STORAGE_AWS_ACCESS_KEY_ID=$STORAGE_AWS_ACCESS_KEY_ID \
    --build-arg STORAGE_AWS_ACCESS_KEY_SECRET=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg STORAGE_AWS_ROLE_ARN=$STORAGE_AWS_ROLE_ARN \
    --build-arg STORAGE_AWS_ENABLE_ACLS=$STORAGE_AWS_ENABLE_ACLS \
    --build-arg STORAGE_GCP_ACCESS_KEY_ID=$STORAGE_GCP_ACCESS_KEY_ID \
    --build-arg STORAGE_GCP_ACCESS_KEY_SECRET=$STORAGE_GCP_ACCESS_KEY_SECRET \
    --build-arg STORAGE_GCP_ROLE_ARN=$STORAGE_GCP_ROLE_ARN \
    --build-arg STORAGE_REGION=$STORAGE_REGION \
    --build-arg STORAGE_S3_AVATAR_DIRECTORY=$STORAGE_S3_AVATAR_DIRECTORY \
    --build-arg SERVE_CLIENT_FROM_STORAGE_PROVIDER=$SERVE_CLIENT_FROM_STORAGE_PROVIDER \
    --build-arg MYSQL_HOST=$MYSQL_HOST \
    --build-arg MYSQL_USER=$MYSQL_USER \
    --build-arg MYSQL_PORT=$MYSQL_PORT \
    --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
    --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
    --build-arg APP_HOST=$APP_HOST \
    --build-arg GCP_PROJECT=$GCP_PROJECT \
    --build-arg GCP_EDGE_CACHE_SERVICE=$GCP_EDGE_CACHE_SERVICE \
    --build-arg GCP_URL_MAP=$GCP_URL_MAP \
    --build-arg VITE_AGENT_API_URL=$VITE_AGENT_API_URL \
    --build-arg VITE_APP_HOST=$VITE_APP_HOST \
    --build-arg VITE_APP_PORT=$VITE_APP_PORT \
    --build-arg VITE_PWA_ENABLED=$VITE_PWA_ENABLED \
    --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
    --build-arg VITE_SERVER_PORT=$VITE_SERVER_PORT \
    --build-arg VITE_FEATHERS_STORE_KEY=$VITE_FEATHERS_STORE_KEY \
    --build-arg VITE_FILE_SERVER=$VITE_FILE_SERVER \
    --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
    --build-arg VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET \
    --build-arg VITE_8TH_WALL=$VITE_8TH_WALL \
    --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST \
    --build-arg VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT \
    --build-arg VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD \
    --build-arg VITE_SOURCEMAPS=$VITE_SOURCEMAPS \
    --build-arg VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL \
    --build-arg VITE_TERMS_OF_SERVICE_ADDRESS=$VITE_TERMS_OF_SERVICE_ADDRESS \
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
    --build-arg VITE_AVATURN_URL=$VITE_AVATURN_URL \
    --build-arg VITE_AVATURN_API=$VITE_AVATURN_API \
    --build-arg VITE_ZENDESK_ENABLED=$VITE_ZENDESK_ENABLED \
    --build-arg VITE_ZENDESK_KEY=$VITE_ZENDESK_KEY \
    --build-arg VITE_DNS_PROVIDER=$VITE_DNS_PROVIDER \
    --build-arg=VITE_MIDDLEWARE_API_URL=$VITE_MIDDLEWARE_API_URL \
    --build-arg VITE_ZENDESK_AUTHENTICATION_ENABLED=$VITE_ZENDESK_AUTHENTICATION_ENABLED .
else
  docker buildx build \
    --builder ir-engine-$PACKAGE \
    -f dockerfiles/$PACKAGE/Dockerfile-$DOCKERFILE \
    --cache-to type=registry,mode=max,image-manifest=true,ref=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:latest_${STAGE}_cache \
    --cache-from type=registry,ref=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME:latest_${STAGE}_cache \
    --build-arg REPO_URL=$SOURCE_REPO_URL \
    --build-arg REPO_NAME=$SOURCE_REPO_NAME \
    --build-arg STAGE=$STAGE \
    --build-arg KUBERNETES=$KUBERNETES \
    --build-arg TAG=$TAG \
    --build-arg NODE_ENV=$NODE_ENV \
    --build-arg STORAGE_PROVIDER=$STORAGE_PROVIDER \
    --build-arg STORAGE_CDN_DOMAIN=$STORAGE_CDN_DOMAIN \
    --build-arg STORAGE_CLOUDFRONT_DISTRIBUTION_ID=$STORAGE_CLOUDFRONT_DISTRIBUTION_ID \
    --build-arg STORAGE_STATIC_RESOURCE_BUCKET=$STORAGE_STATIC_RESOURCE_BUCKET \
    --build-arg STORAGE_AWS_ACCESS_KEY_ID=$STORAGE_AWS_ACCESS_KEY_ID \
    --build-arg STORAGE_AWS_ACCESS_KEY_SECRET=$STORAGE_AWS_ACCESS_KEY_SECRET \
    --build-arg STORAGE_AWS_ROLE_ARN=$STORAGE_AWS_ROLE_ARN \
    --build-arg STORAGE_AWS_ENABLE_ACLS=$STORAGE_AWS_ENABLE_ACLS \
    --build-arg STORAGE_GCP_ACCESS_KEY_ID=$STORAGE_GCP_ACCESS_KEY_ID \
    --build-arg STORAGE_GCP_ACCESS_KEY_SECRET=$STORAGE_GCP_ACCESS_KEY_SECRET \
    --build-arg STORAGE_GCP_ROLE_ARN=$STORAGE_GCP_ROLE_ARN \
    --build-arg STORAGE_REGION=$STORAGE_REGION \
    --build-arg STORAGE_S3_AVATAR_DIRECTORY=$STORAGE_S3_AVATAR_DIRECTORY \
    --build-arg SERVE_CLIENT_FROM_STORAGE_PROVIDER=$SERVE_CLIENT_FROM_STORAGE_PROVIDER \
    --build-arg MYSQL_HOST=$MYSQL_HOST \
    --build-arg MYSQL_USER=$MYSQL_USER \
    --build-arg MYSQL_PORT=$MYSQL_PORT \
    --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
    --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
    --build-arg APP_HOST=$APP_HOST \
    --build-arg GCP_PROJECT=$GCP_PROJECT \
    --build-arg GCP_EDGE_CACHE_SERVICE=$GCP_EDGE_CACHE_SERVICE \
    --build-arg GCP_URL_MAP=$GCP_URL_MAP \
    --build-arg VITE_AGENT_API_URL=$VITE_AGENT_API_URL \
    --build-arg VITE_APP_HOST=$VITE_APP_HOST \
    --build-arg VITE_APP_PORT=$VITE_APP_PORT \
    --build-arg VITE_PWA_ENABLED=$VITE_PWA_ENABLED \
    --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
    --build-arg VITE_SERVER_PORT=$VITE_SERVER_PORT \
    --build-arg VITE_FEATHERS_STORE_KEY=$VITE_FEATHERS_STORE_KEY \
    --build-arg VITE_FILE_SERVER=$VITE_FILE_SERVER \
    --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
    --build-arg VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET \
    --build-arg VITE_8TH_WALL=$VITE_8TH_WALL \
    --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST \
    --build-arg VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT \
    --build-arg VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD \
    --build-arg VITE_SOURCEMAPS=$VITE_SOURCEMAPS \
    --build-arg VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL \
    --build-arg VITE_TERMS_OF_SERVICE_ADDRESS=$VITE_TERMS_OF_SERVICE_ADDRESS \
    --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
    --build-arg VITE_AVATURN_URL=$VITE_AVATURN_URL \
    --build-arg VITE_AVATURN_API=$VITE_AVATURN_API \
    --build-arg VITE_ZENDESK_ENABLED=$VITE_ZENDESK_ENABLED \
    --build-arg VITE_ZENDESK_KEY=$VITE_ZENDESK_KEY \
    --build-arg VITE_DNS_PROVIDER=$VITE_DNS_PROVIDER \
    --build-arg=VITE_MIDDLEWARE_API_URL=$VITE_MIDDLEWARE_API_URL \
    --build-arg VITE_ZENDESK_AUTHENTICATION_ENABLED=$VITE_ZENDESK_AUTHENTICATION_ENABLED .
fi

BUILD_END_TIME=$(date +"%d-%m-%yT%H-%M-%S")
echo "${PACKAGE} build started at ${BUILD_START_TIME}, ended at ${BUILD_END_TIME}"
