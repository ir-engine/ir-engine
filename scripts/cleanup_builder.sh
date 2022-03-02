#!/bin/bash
set -e
set -x

LABEL=$1

docker container prune --force
docker image prune -f

ANALYTICS_IMAGE_ID="$(docker images $LABEL-analytics:latest --format {{.ID}})"
API_IMAGE_ID="$(docker images $LABEL-api:latest --format {{.ID}})"
CLIENT_IMAGE_ID="$(docker images $LABEL-client:latest --format {{.ID}})"
GAMESERVER_IMAGE_ID="$(docker images $LABEL-gameserver:latest --format {{.ID}})"
TESTBOT_IMAGE_ID="$(docker images $LABEL-testbot:latest --format {{.ID}})"

if [ -n "$ANALYTICS_IMAGE_ID" ]
then
  docker image rm -f $ANALYTICS_IMAGE_ID
fi

if [ -n "$API_IMAGE_ID" ]
then
  docker image rm -f $API_IMAGE_ID
fi

if [ -n "$CLIENT_IMAGE_ID" ]
then
  docker image rm -f $CLIENT_IMAGE_ID
fi

if [ -n "$GAMESERVER_IMAGE_ID" ]
then
  docker image rm -f $GAMESERVER_IMAGE_ID
fi

if [ -n "$TESTBOT_IMAGE_ID" ]
then
  docker image rm -f $TESTBOT_IMAGE_ID
fi
