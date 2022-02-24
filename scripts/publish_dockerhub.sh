#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2
PACKAGE=$3

docker tag ${LABEL}-$PACKAGE ${LABEL}-$PACKAGE:${TAG}
docker push ${LABEL}-$PACKAGE:${TAG}