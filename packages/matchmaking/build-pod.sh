#!/bin/bash
if [[ -z $REGISTRY ]]
then
  source ./vars.sh
fi

if [[ -z $DEPLOY_TIME ]]
then
  DEPLOY_TIME=`date +"%d-%m-%yT%H-%M-%S"`
fi

if [ -z "$1" ]
then
  echo "module name is required"
fi

MODULE=xrengine-matchmaking-$1

pushd "./open-match-custom-pods/$1" || exit

echo "BUILDING $1 as $MODULE":$DEPLOY_TIME
docker build -t $MODULE .
docker tag $MODULE:latest $MODULE:$DEPLOY_TIME

if [[ $2 = "push" ]]
then
  docker tag $MODULE:$DEPLOY_TIME $REGISTRY/$MODULE:$DEPLOY_TIME
  echo "PUSHING $REGISTRY/$MODULE":$DEPLOY_TIME
  docker push $REGISTRY/$MODULE:$DEPLOY_TIME
fi

popd || exit
