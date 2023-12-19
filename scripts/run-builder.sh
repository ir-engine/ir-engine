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
  @@ -27,19 +26,22 @@ rm package.json
mv package.jsonmoved package.json
npm run prepare-database >prepare-database-build-logs.txt 2>prepare-database-build-error.txt || npm run record-build-error -- --service=prepare-database
test -s prepare-database-build-error.txt && npm run record-build-error -- --service=prepare-database
cd packages/client && npx cross-env ts-node --swc scripts/create-env-production.ts >buildenv-build-logs.txt 2>buildenv-build-error.txt || (cd "$HOME/app" && echo "$PWD" && npm run record-build-error -- --service=buildenv)
test -s buildenv-build-error.txt && npm run record-build-error -- --service=buildenv
if [ -n "$TWA_LINK" ]
then
  npx cross-env ts-node --swc scripts/populate-assetlinks.ts >populate-assetlinks-build-logs.txt >populate-assetlinks-build-logs.txt 2>populate-assetlinks-build-error.txt || npm run record-build-error -- --service=populate-assetlinks
test -s populate-assetlinks-build-error.txt && npm run record-build-error -- --service=populate-assetlinks
fi
cd ../..
bash ./scripts/cleanup_builder.sh $DOCKER_LABEL


if [ $PRIVATE_ECR == "true" ]
then
  aws ecr get-login-password --region $AWS_REGION | docker login -u AWS --password-stdin $ECR_URL
else
  aws ecr-public get-login-password --region us-east-1 | docker login -u AWS --password-stdin $ECR_URL
  @@ -54,8 +56,7 @@ npm run record-build-error -- --service=root --isDocker=true

npm install -g cli @aws-sdk/client-s3

if [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" = "true" ] && [ "$STORAGE_PROVIDER" = "s3" ]
then
  npx cross-env ts-node --swc scripts/get-deletable-client-files.ts

  bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL api api $START_TIME $AWS_REGION $NODE_ENV $PRIVATE_ECR >api-build-logs.txt 2>api-build-error.txt &
  @@ -71,8 +72,7 @@ then
  npm run record-build-error -- --service=instanceserver --isDocker=true
  npm run record-build-error -- --service=taskserver --isDocker=true
  #npm run record-build-error -- --service=testbot --isDocker=true
elif [ "$SERVE_CLIENT_FROM_API" = "true" ]
then
  bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL api api-client $START_TIME $AWS_REGION $NODE_ENV $PRIVATE_ECR >api-build-logs.txt 2>api-build-error.txt &
  bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL instanceserver instanceserver $START_TIME $AWS_REGION $NODE_ENV $PRIVATE_ECR >instanceserver-build-logs.txt 2>instanceserver-build-error.txt &
  bash ./scripts/build_and_publish_package.sh $RELEASE_NAME $DOCKER_LABEL taskserver taskserver $START_TIME $AWS_REGION $NODE_ENV $PRIVATE_ECR >taskserver-build-logs.txt 2>taskserver-build-error.txt &
  @@ -106,25 +106,24 @@ npx cross-env ts-node --swc scripts/update-cronjob-image.ts --repoName=${REPO_NA

npx cross-env ts-node --swc scripts/clear-projects-rebuild.ts
npm run record-build-success
DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`

bash ./scripts/cleanup_builder.sh $DOCKER_LABEL

END_TIME=`date +"%d-%m-%yT%H-%M-%S"`
echo "Started build at $START_TIME, deployed image to K8s at $DEPLOY_TIME, ended at $END_TIME"
sleep 3m
if [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" = "true" ] && [ "$STORAGE_PROVIDER" = "s3" ] ; then
  npx cross-env ts-node --swc scripts/delete-old-s3-files.ts;
  echo "Deleted old client files from S3"
fi

echo $(kubectl get jobs | grep $RELEASE_NAME-builder-etherealengine-builder)
if [ -z "$(kubectl get jobs | grep $RELEASE_NAME-builder-etherealengine-builder)" ]
then
  echo "Non-job builder, sleeping"
  sleep infinity
else
  echo "Job-based builder, killing docker container"
  pkill dockerd
  pkill docker-init
fi