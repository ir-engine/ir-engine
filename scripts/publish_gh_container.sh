#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

docker tag ${LABEL} ${LABEL}:${TAG}
docker push ${LABEL}:${TAG}