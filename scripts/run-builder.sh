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
npm run install-projects
bash ./scripts/build_docker.sh $RELEASE_NAME $DOCKER_LABEL $PRIVATE_ECR $AWS_REGION
npm install -g cli aws-sdk
bash ./scripts/publish_ecr.sh $RELEASE_NAME ${TAG}__${START_TIME} $DOCKER_LABEL $PRIVATE_ECR $AWS_REGION
bash ./scripts/deploy.sh $RELEASE_NAME ${TAG}__${START_TIME}
DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`
bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL
bash ./scripts/cleanup_builder.sh ${TAG}__${START_TIME} $DOCKER_LABEL
END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Started build at $START_TIME, deployed image to K8s at $DEPLOY_TIME, ended at $END_TIME"
sleep infinity
