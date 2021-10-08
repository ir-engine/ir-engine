#!/bin/bash



# Install the core Open Match services.
kubectl apply --namespace open-match \
  -f https://open-match.dev/install/v1.3.0-rc.1/yaml/01-open-match-core.yaml