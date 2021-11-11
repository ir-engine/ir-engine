#!/bin/bash
source ./vars.sh

if [ -z "$1" ]
then
  echo "module name is required"
fi

MODULE=xrengine-matchmaking-$1

pushd "./open-match-custom-pods/$1" || exit

echo "BUILDING $1 as $MODULE"
docker build -t $REGISTRY/"$MODULE" .

if [[ $2 = "push" ]]
then
  echo "PUSHING $REGISTRY/$MODULE"
  docker push $REGISTRY/"$MODULE"
fi

popd || exit
