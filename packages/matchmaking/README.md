# xrengine-matchmaking

Detailed instructions: [Install Core Open Match](https://open-match.dev/site/docs/installation/yaml/#install-core-open-match)

game modes hardcoded:
`open-match-custom-pods/director/profile.go:24`

team size is probably here:
`open-match-custom-pods/matchfunction/mmf/matchfunction.go`
ticketsPerPoolPerMatch


# Install the core Open Match services.
```bash
kubectl apply --namespace open-match \
-f https://open-match.dev/install/v1.3.0-rc.1/yaml/01-open-match-core.yaml
```

```bash
kubectl apply --namespace open-match \
  -f https://open-match.dev/install/v1.3.0-rc.1/yaml/06-open-match-override-configmap.yaml \
  -f https://open-match.dev/install/v1.3.0-rc.1/yaml/07-open-match-default-evaluator.yaml
```


# local development
```bash
minikube start
eval $(minikube docker-env)
```

```bash
REGISTRY=lagunalabs

kubectl create namespace xrengine-matchmaking

open-match-custom-pods/build.sh matchfunction
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/matchfunction/matchfunction.yaml | sed "s|Always|Never|g" | kubectl apply -f -

open-match-custom-pods/build.sh director
sed "s|REGISTRY_PLACEHOLDER|$REGISTRY|g" open-match-custom-pods/director/director.yaml | sed "s|Always|Never|g" | kubectl apply -f -
```

```bash
kubectl port-forward --namespace open-match service/open-match-frontend 51504:51504
```

delete custom pods
```bash
kubectl -n xrengine-matchmaking delete pod,svc --all
```