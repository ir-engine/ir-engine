#!/bin/bash
source ./vars.sh

eval $(minikube docker-env)

kubectl -n xrengine-matchmaking delete pod,svc --all

./build-all-pods.sh

sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/matchfunction/matchfunction.yaml | sed "s|Always|Never|g" | kubectl apply -f -
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/director/director.yaml | sed "s|Always|Never|g" | kubectl apply -f -