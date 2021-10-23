#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

docker image prune -f
IMAGE_ID="$(docker images $LABEL:latest --format {{.ID}})"
docker image rm -f $IMAGE_ID
