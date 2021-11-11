#!/bin/bash
source ./vars.sh

./build-pod.sh director "$1"
./build-pod.sh matchfunction "$1"

#kubectl -n xrengine-matchmaking delete pod,svc --all

if [[ $2 = "push" ]]
then
  docker push $REGISTRY/xrengine-matchmaking-director
  docker push $REGISTRY/xrengine-matchmaking-matchfunction
fi