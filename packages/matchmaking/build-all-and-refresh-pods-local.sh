#!/bin/bash
if [[ -z $REGISTRY ]]
then
  source ./vars.sh
fi

DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`
eval $(minikube docker-env)

REGISTRY=$REGISTRY DEPLOY_TIME=$DEPLOY_TIME ./build-all-pods.sh

sleep 2
if [[ -z $HELM_CONFIG ]]
then
  helm upgrade --install --reuse-values --set director.image.tag=$DEPLOY_TIME,matchfunction.image.tag=$DEPLOY_TIME local-matchmaking ../ops/xrengine-matchmaking
else
  helm upgrade --install --reuse-values -f $HELM_CONFIG --set director.image.tag=$DEPLOY_TIME,matchfunction.image.tag=$DEPLOY_TIME local-matchmaking ../ops/xrengine-matchmaking
fi