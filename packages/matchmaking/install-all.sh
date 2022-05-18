#!/bin/bash
source ./vars.sh

minikube start
kubectl apply --namespace open-match \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/01-open-match-core.yaml

kubectl apply --namespace open-match \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/06-open-match-override-configmap.yaml \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/07-open-match-default-evaluator.yaml


kubectl create namespace xrengine-matchmaking

#this line for localhost development
eval $(minikube docker-env)

./build-all-pods.sh

sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/matchfunction/matchfunction.yaml | sed "s|Always|Never|g" | kubectl apply -f -
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/director/director.yaml | sed "s|Always|Never|g" | kubectl apply -f -

eval $(minikube docker-env -u)

kubectl port-forward --namespace open-match service/open-match-frontend 51504:51504 &