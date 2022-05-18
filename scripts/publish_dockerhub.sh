#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2
PACKAGE=$3

IMAGE_ID="$(docker images $LABEL-$PACKAGE:latest --format {{.ID}})"
if [ -n "$IMAGE_ID" ]
then
  docker tag ${LABEL}-$PACKAGE ${LABEL}-$PACKAGE:${TAG}
  docker push ${LABEL}-$PACKAGE:${TAG}
fi