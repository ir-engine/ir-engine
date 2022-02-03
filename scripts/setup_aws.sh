#!/bin/bash
set -e
set -x

if [[ -z $(which unzip) ]]
then
  if [[ "$(id -u)" == "0" ]]
  then
    apt install unzip
  else
    sudo apt install unzip
  fi
fi
if [[ -z $(which aws) ]]
then
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip -q awscliv2.zip
  ./aws/install
fi

set +x

aws configure set aws_access_key_id $1
aws configure set aws_secret_access_key $2
aws configure set default.region $3

aws eks update-kubeconfig --name $4

cat ~/.kube/config
aws sts get-caller-identity
kubectl get svc