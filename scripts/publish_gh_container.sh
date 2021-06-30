#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

echo "$GITHUB_TOKEN" | docker login ghcr.io -u "$GITHUB_USERNAME" --password-stdin

echo ghcr.io/${GITHUB_USERNAME}/${LABEL}:${TAG}

docker tag ${LABEL} ghcr.io/${GITHUB_USERNAME,,}/${LABEL}:${TAG}
docker push ghcr.io/${GITHUB_USERNAME,,}/${LABEL}:${TAG}