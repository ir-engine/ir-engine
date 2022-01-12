#!/bin/bash
set -e
set -x

TAG=$1
LABEL=$2

docker image prune -f
ANALYTICS_IMAGE_ID="$(docker images $LABEL-analytics:latest --format {{.ID}})"
API_IMAGE_ID="$(docker images $LABEL-api:latest --format {{.ID}})"
CLIENT_IMAGE_ID="$(docker images $LABEL-client:latest --format {{.ID}})"
GAMESERVER_IMAGE_ID="$(docker images $LABEL-gameserver:latest --format {{.ID}})"
docker image rm -f $ANALYTICS_IMAGE_ID $API_IMAGE_ID $CLIENT_IMAGE_ID $GAMESERVER_IMAGE_ID
