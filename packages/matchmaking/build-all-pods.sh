#!/bin/bash
if [[ -z $REGISTRY ]]
then
  source ./vars.sh
fi
if [[ -z $DEPLOY_TIME ]]
then
  DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`
fi
echo "REGISTRY is $REGISTRY"
REGISTRY=$REGISTRY DEPLOY_TIME=$DEPLOY_TIME ./build-pod.sh director "$1"
REGISTRY=$REGISTRY DEPLOY_TIME=$DEPLOY_TIME ./build-pod.sh matchfunction "$1"

if [[ $2 = "push" ]]
then
  docker push $REGISTRY/xrengine-matchmaking-director
  docker push $REGISTRY/xrengine-matchmaking-matchfunction
fi