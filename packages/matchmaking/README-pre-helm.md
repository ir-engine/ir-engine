# xrengine-matchmaking

##first run:
start minikube and install open-match pods, configs and services
```bash
minikube start
kubectl apply --namespace open-match \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/01-open-match-core.yaml

kubectl apply --namespace open-match \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/06-open-match-override-configmap.yaml \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/07-open-match-default-evaluator.yaml
```

* note: sometimes on localhost redis synchronisation is not working correctly,
it's usually leads to "Ticket not found" on getting ticket assignment even if ticket was just created. 
if this happens then run `kubectl scale -n open-match statefulset open-match-redis-node --replicas=1` to limit redis pod to one.  

then build custom pods
```bash
cd packages/matchmaking/

kubectl create namespace xrengine-matchmaking

#this line for localhost development
eval $(minikube docker-env)

./build-all-pods.sh

REGISTRY=lagunalabs
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/matchfunction/matchfunction.yaml | sed "s|Always|Never|g" | kubectl apply -f -
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/director/director.yaml | sed "s|Always|Never|g" | kubectl apply -f -
```

open ports, in different terminal
```bash
kubectl port-forward --namespace open-match service/open-match-frontend 51504:51504
```

#all next runs:
```bash
minikube start
kubectl port-forward --namespace open-match service/open-match-frontend 51504:51504
```

when update needed from pods, navigate to `packages/matchmaking`
and run `./build-pod.sh director` or  `./build-pod.sh matchfunction` to build corresponding pod



# misc

===============================================================

Detailed instructions on open match: [Install Core Open Match](https://open-match.dev/site/docs/installation/yaml/#install-core-open-match)

###hardcoded
game modes hardcoded:
`open-match-custom-pods/director/profile.go:24`

team size is probably here:
`open-match-custom-pods/matchfunction/mmf/matchfunction.go` in `ticketsPerPoolPerMatch`

###cleanup
delete custom pods
```bash
kubectl -n xrengine-matchmaking delete pod,svc --all
kubectl delete namespace xrengine-matchmaking
```

delete open-match
```bash
kubectl -n open-match delete pod,svc --all
kubectl delete namespace open-match
```