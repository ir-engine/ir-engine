#!/bin/bash

REGISTRY=xianizpua

if [ -z "$1" ]
then
  echo "module name is required"
fi

MODULE=mm101-tutorial-$1

cd "$1" || exit

echo "BUILDING $1 as $MODULE"
docker build -t $REGISTRY/"$MODULE" .

if [[ $2 = "push" ]]
then
  echo "PUSHING $REGISTRY/$MODULE"
  docker push $REGISTRY/"$MODULE"
fi

cd ..
