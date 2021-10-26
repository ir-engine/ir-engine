#!/bin/bash

# docker hub registry
REGISTRY=lagunalabs

if [ -z "$1" ]
then
  echo "module name is required"
fi

MODULE=xrengine-matchmaking-$1

cd "$1" || exit

echo "BUILDING $1 as $MODULE"
docker build -t $REGISTRY/"$MODULE" .

if [[ $2 = "push" ]]
then
  echo "PUSHING $REGISTRY/$MODULE"
  docker push $REGISTRY/"$MODULE"
fi

cd ..
