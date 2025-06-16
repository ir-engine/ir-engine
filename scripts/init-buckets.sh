#!/bin/bash

# Use the MINIO_SERVER environment variable for flexibility
mc alias set local $MINIO_SERVER $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD --insecure

# Buckets to create with public policy
buckets=(
  "ir-engine-static-resources"
  "ir-engine-static-resources-test"
  "ir-engine-microk8s-static-resources"
  "ir-engine-minikube-static-resources"
)

for bucket in "${buckets[@]}"; do
  mc mb local/$bucket --insecure || echo "Bucket $bucket already exists"
  mc anonymous set public local/$bucket --insecure
  echo "Bucket $bucket created and set to public"
done
