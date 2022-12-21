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
npm run create-build-status
BUILDER_RUN=$(tail -1 builder-run.txt)
npm run install-projects >project-install-build-logs.txt 2>project-install-build-error.txt
test -s project-install-build-error.txt && npm run record-build-error -- --service=project-install
npm run prepare-database >prepare-database-build-logs.txt 2>prepare-database-build-error.txt
test -s prepare-database-build-error.txt && npm run record-build-error -- --service=prepare-database
npm run update-site-manifest >update-site-manifest-build-logs.txt 2>update-site-manifest-build-error.txt
test -s update-site-manifest-build-error.txt && npm run record-build-error -- --service=update-site-manifest
cd packages/client && npm run buildenv >buildenv-build-logs.txt 2>buildenv-build-error.txt
test -s buildenv-build-error.txt && npm run record-build-error -- --service=buildenv
if [ -n "$TWA_LINK" ]
then
  npm run populate-assetlinks >populate-assetlinks-build-logs.txt >populate-assetlinks-build-logs.txt 2>populate-assetlinks-build-error.txt
test -s populate-assetlinks-build-error.txt && npm run record-build-error -- --service=populate-assetlinks
fi
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

DOCKER_BUILDKIT=1 docker build -t root-builder -f dockerfiles/package-root/Dockerfile-root . >root-builder-build-logs.txt 2>root-builder-build-error.txt
npm run record-build-error -- --service=root-builder --isDocker=true

npm install -g cli aws-sdk

if [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" = "true" ] && [ "$STORAGE_PROVIDER" = "aws" ] ; then npm run list-client-s3-files-to-delete ; fi

bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL api $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV >api-build-logs.txt 2>api-build-error.txt &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL client $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV >client-build-logs.txt 2>client-build-error.txt &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL instanceserver $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV >instanceserver-build-logs.txt 2>instanceserver-build-error.txt &
bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL taskserver $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV >taskserver-build-logs.txt 2>taskserver-build-error.txt &
#bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL testbot $START_TIME $PRIVATE_ECR $AWS_REGION $NODE_ENV >testbot-build-logs.txt 2>testbot-build-error.txt && &

wait < <(jobs -p)

npm run record-build-error -- --service=api --isDocker=true
npm run record-build-error -- --service=client --isDocker=true
npm run record-build-error -- --service=instanceserver --isDocker=true
npm run record-build-error -- --service=taskserver --isDocker=true
#npm run record-build-error -- --service=testbot --isDocker=true

bash ./scripts/deploy.sh $RELEASE_NAME ${TAG}__${START_TIME}

npm run clear-projects-rebuild
npm run record-build-success
DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`

if [ $PUBLISH_DOCKERHUB == 'true' ]
then
  echo "$DOCKER_HUB_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL api &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL client &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL instanceserver &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL taskserver &
  bash ./scripts/publish_dockerhub.sh ${TAG}__${START_TIME} $DOCKER_LABEL testbot &
  wait
fi

bash ./scripts/cleanup_builder.sh $DOCKER_LABEL

END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Started build at $START_TIME, deployed image to K8s at $DEPLOY_TIME, ended at $END_TIME"
sleep 5m
if [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" = "true" ] && [ "$STORAGE_PROVIDER" = "aws" ] ; then
  npm run delete-old-s3-files;
  echo "Deleted old client files from S3"
fi

sleep infinity