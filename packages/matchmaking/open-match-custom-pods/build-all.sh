#!/bin/bash
REGISTRY=lagunalabs

./build.sh director "$1"
./build.sh matchfunction "$1"

#kubectl -n xrengine-matchmaking delete pod,svc --all

if [[ $2 = "push" ]]
then
  docker push $REGISTRY/xrengine-matchmaking-director
  docker push $REGISTRY/xrengine-matchmaking-matchfunction
fi