#!/bin/bash
set -e
set -x

until [ -f /var/lib/docker/certs/client/ca.pem ]
do
  echo "Waiting for /var/lib/docker/certs/client/ca.pem to be available from dind volume"
  sleep 1
done
START_TIME=`date +"%d-%m-%yT%H-%M-%S"`
mkdir -pv ~/.docker
cp -v /var/lib/docker/certs/client/* ~/.docker
touch ./builder-started.txt
bash ./scripts/setup_helm.sh
bash ./scripts/setup_aws.sh $AWS_ACCESS_KEY $AWS_SECRET $AWS_REGION $CLUSTER_NAME
npm run check-db-exists
npm run install-projects
npm run prepare-database
cd packages/client && npm run buildenv
cd ../..
bash ./scripts/cleanup_builder.sh $DOCKER_LABEL


if [ $PRIVATE_ECR == "true" ]
then
  aws ecr get-login-password --region $AWS_REGION | docker login -u AWS --password-stdin $ECR_URL
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
fi

mkdir -p ./project-package-jsons/projects/default-project
cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project
find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;

DOCKER_BUILDKIT=1 docker build -t root-builder -f dockerfiles/package-root/Dockerfile-root .

npm install -g cli aws-sdk

bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL analytics $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL api $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL client $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL instanceserver $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL testbot $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV &

wait

bash ./scripts/deploy.sh $RELEASE_NAME ${TAG}__${START_TIME}

DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`

if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL analytics &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL api &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL client &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL instanceserver &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL testbot &
  wait
fi

bash ./scripts/cleanup_builder.sh $DOCKER_LABEL

END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Started build at $START_TIME, deployed image to K8s at $DEPLOY_TIME, ended at $END_TIME"
sleep infinity
