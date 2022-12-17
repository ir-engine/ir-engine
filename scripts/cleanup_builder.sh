#!/bin/bash
set -e
set -x

LABEL=$1

docker container prune --force
docker image prune -f

API_IMAGE_ID="$(docker images $LABEL-api:latest --format {{.ID}})"
CLIENT_IMAGE_ID="$(docker images $LABEL-client:latest --format {{.ID}})"
INSTANCESERVER_IMAGE_ID="$(docker images $LABEL-instanceserver:latest --format {{.ID}})"
TASKSERVER_IMAGE_ID="$(docker images $LABEL-taskserver:latest --format {{.ID}})"
TESTBOT_IMAGE_ID="$(docker images $LABEL-testbot:latest --format {{.ID}})"

if [ -n "$TASKSERVER_IMAGE_ID" ]
then
  docker image rm -f $TASKSERVER_IMAGE_ID
fi

if [ -n "$API_IMAGE_ID" ]
then
  docker image rm -f $API_IMAGE_ID
fi

if [ -n "$CLIENT_IMAGE_ID" ]
then
  docker image rm -f $CLIENT_IMAGE_ID
fi

if [ -n "$INSTANCESERVER_IMAGE_ID" ]
then
  docker image rm -f $INSTANCESERVER_IMAGE_ID
fi

if [ -n "$TESTBOT_IMAGE_ID" ]
then
  docker image rm -f $TESTBOT_IMAGE_ID
fi
