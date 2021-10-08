#!/bin/bash
REGISTRY=xianizpua

./build.sh director "$1"
./build.sh frontend "$1"
./build.sh matchfunction "$1"

#kubectl -n mm101-tutorial delete pod,svc --all

if [[ $2 = "push" ]]
then
  docker push $REGISTRY/mm101-tutorial-director
  docker push $REGISTRY/mm101-tutorial-frontend
  docker push $REGISTRY/mm101-tutorial-matchfunction
fi