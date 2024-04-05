set -x

STAGE=$1
TAG=$2

#kubectl delete job $STAGE-etherealengine-testbot

npx cross-env ts-node --swc scripts/fetch-helm-versions.ts --stage=${RELEASE_NAME}
docker manifest inspect $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-api:$TAG >api-image.txt 2>&1
if [ "$SERVE_CLIENT_FROM_API" != "true" ] && [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" != "true"]
then
  docker manifest inspect $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-client:$TAG > client-image.txt  2>&1
fi
docker manifest inspect $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-instanceserver:$TAG > instanceserver-image.txt 2>&1
docker manifest inspect $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-taskserver:$TAG > taskserver-image.txt 2>&1

HELM_MAIN_VERSION=$(cat helm-main-version.txt)

if [ ! -f "api-image.txt" ] || [ -z "$(grep -L "no such manifest" api-image.txt)" ]
then
  echo "API image was not built and uploaded properly"
  exit 1
elif ([ "$SERVE_CLIENT_FROM_API" != "true" ] && [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" != "true"] && [ ! -f "client-image.txt" ]) || ([ "$SERVE_CLIENT_FROM_API" != "true" ] && [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" != "true"] && [ -z "$(grep -L "no such manifest" client-image.txt)" ])
then
  echo "client image was not built and uploaded properly"
  exit 1
elif [ ! -f "instanceserver-image.txt" ] || [ -z "$(grep -L "no such manifest" instanceserver-image.txt)" ]
then
  echo "Instanceserver image was not built and uploaded properly"
  exit 1
elif [ ! -f "taskserver-image.txt" ] || [ -z "$(grep -L "no such manifest" taskserver-image.txt)" ]
then
  echo "Taskserver image was not built and uploaded properly"
  exit 1
else
  if [ "$SERVE_CLIENT_FROM_API" = "true" ] || [ "$SERVE_CLIENT_FROM_STORAGE_PROVIDER" = "true"]
  then
    helm upgrade --reuse-values --version $HELM_MAIN_VERSION --set taskserver.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-taskserver,taskserver.image.tag=$TAG,api.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-api,api.image.tag=$TAG,instanceserver.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-instanceserver,instanceserver.image.tag=$TAG,testbot.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-testbot,testbot.image.tag=$TAG $STAGE etherealengine/etherealengine
  else
    helm upgrade --reuse-values --version $HELM_MAIN_VERSION --set taskserver.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-taskserver,taskserver.image.tag=$TAG,api.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-api,api.image.tag=$TAG,instanceserver.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-instanceserver,instanceserver.image.tag=$TAG,testbot.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-testbot,testbot.image.tag=$TAG,client.image.repository=$DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-client,client.image.tag=$TAG $STAGE etherealengine/etherealengine
  fi
fi
