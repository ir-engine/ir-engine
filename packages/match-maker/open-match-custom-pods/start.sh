#!/bin/bash

REGISTRY=xianizpua

#docker push xianizpua/mm101-tutorial-frontend
#docker build -t xianizpua/mm101-tutorial-matchfunction .

# kubectl -n mm101-tutorial delete pod,svc --all

# # Open the port to the pod so that it can be accessed locally.
# kubectl port-forward --namespace open-match service/om-swaggerui 51500:51500


# kubectl port-forward --namespace open-match service/open-match-frontend 51504:51504

#minikube start
eval $(minikube docker-env)
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" matchmaker.yaml | sed "s|Always|Never|g" | kubectl apply -f -