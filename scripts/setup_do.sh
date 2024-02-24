#!/bin/bash
set -e
set -x

if [[ -z $(which doctl) ]]; then
  curl -OL https://github.com/digitalocean/doctl/releases/download/v1.100.0/doctl-1.100.0-linux-amd64.tar.gz
  tar xf doctl-1.100.0-linux-amd64.tar.gz
  mv doctl /usr/local/bin
fi

set +x

# Authenticate with DigitalOcean with access token
doctl auth init -t $1

# Set kubectl context to the existing cluster with its name provided as variable
doctl kubernetes cluster kubeconfig save $2

cat ~/.kube/config
# Verifying the cluster connection
kubectl cluster-info

set -x
set +x
