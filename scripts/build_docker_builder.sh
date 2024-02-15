#!/bin/bash
set -e
set -x

STAGE=$1
TAG=$2
LABEL=$3
REGION=$4
PRIVATE_ECR=$5
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

docker buildx create --use --driver=docker-container

if [ $PRIVATE_ECR == "true" ]
then
  aws ecr get-login-password --region $REGION | docker login -u AWS --password-stdin $ECR_URL
  aws ecr describe-repositories --repository-names $REPO_NAME-builder --region $REGION || aws ecr create-repository --repository-name $REPO_NAME-builder --region $REGION
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
  aws ecr-public describe-repositories --repository-names $REPO_NAME-builder --region us-east-1 || aws ecr-public create-repository --repository-name $REPO_NAME-builder --region us-east-1
fi

mkdir -p ./project-package-jsons/projects/default-project
mkdir -p packages/projects/projects
cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project
find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;

Repo_URL=$ECR_URL
REPO_NAME1=$REPO_NAME
echo "REPO_NAME1: $REPO_NAME1"
echo "Repo_URL: $Repo_URL"
docker buildx build \
    --load \
    --build-arg NODE_ENV=$NODE_ENV \
    -t $ECR_URL/$REPO_NAME-root:${TAG} \
    -t $ECR_URL/$REPO_NAME-root:latest_$STAGE \
    -f dockerfiles/root/Dockerfile-root .
docker push --all-tags $ECR_URL/$REPO_NAME-root

if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

  docker buildx build \
    --push \
    --cache-to type=gha,mode=max \
    --cache-from type=gha \
    --build-arg ECR_URL=$ECR_URL \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    -t $ECR_URL/$-builder:latest_$STAGE \
    -t $ECR_URL/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -t ${LABEL}-builREPO_NAMEder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
else
  docker buildx build \
    --push \
    --cache-to type=gha,mode=max \
    --cache-from type=gha \
    --build-arg ECR_URL=$ECR_URL \
    --build-arg REPO_NAME=$REPO_NAME \
    --build-arg STAGE=$STAGE \
    -t $ECR_URL/$REPO_NAME-builder:latest_$STAGE \
    -t $ECR_URL/$REPO_NAME-builder:"${EEVERSION}_${TAG}" \
    -f dockerfiles/builder/Dockerfile-builder .
fi

if [ $PRIVATE_ECR == "true" ]
then
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-builder --region $REGION --service builder --releaseName $STAGE
else
  node ./scripts/prune_ecr_images.js --repoName $REPO_NAME-builder --region us-east-1 --service builder --releaseName $STAGE --public
fi

# cache links to use once ECR supports cache manifests
#  --cache-to type=registry,ref=$ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache,mode=max \
#  --cache-from $ECR_URL/$REPO_NAME-builder:latest_"${STAGE}"_cache \