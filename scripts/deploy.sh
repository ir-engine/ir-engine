set -x

STAGE=$1
TAG=$2

#kubectl delete job $STAGE-etherealengine-testbot

docker manifest inspect $ECR_URL/$REPO_NAME-api:$TAG >api-image.txt 2>&1
docker manifest inspect $ECR_URL/$REPO_NAME-client:$TAG > client-image.txt  2>&1
docker manifest inspect $ECR_URL/$REPO_NAME-instanceserver:$TAG > instanceserver-image.txt 2>&1
docker manifest inspect $ECR_URL/$REPO_NAME-taskserver:$TAG > taskserver-image.txt 2>&1

if [ ! -f "api-image.txt" ] || [ -z "$(grep -L "no such manifest" api-image.txt)" ]
then
  echo "API image was not built and uploaded properly"
  exit 1
elif [ ! -f "api-image.txt" ] || [ -z "$(grep -L "no such manifest" client-image.txt)" ]
then
  echo "client image was not built and uploaded properly"
  exit 1
elif [ ! -f "api-image.txt" ] || [ -z "$(grep -L "no such manifest" instanceserver-image.txt)" ]
then
  echo "Instanceserver image was not built and uploaded properly"
  exit 1
elif [ ! -f "api-image.txt" ] || [ -z "$(grep -L "no such manifest" taskserver-image.txt)" ]
then
  echo "Taskserver image was not built and uploaded properly"
  exit 1
else
  helm upgrade --reuse-values --set taskserver.image.repository=$ECR_URL/$REPO_NAME-taskserver,taskserver.image.tag=$TAG,api.image.repository=$ECR_URL/$REPO_NAME-api,api.image.tag=$TAG,instanceserver.image.repository=$ECR_URL/$REPO_NAME-instanceserver,instanceserver.image.tag=$TAG,testbot.image.repository=$ECR_URL/$REPO_NAME-testbot,testbot.image.tag=$TAG,client.image.repository=$ECR_URL/$REPO_NAME-client,client.image.tag=$TAG $STAGE etherealengine/etherealengine
fi
