#!/bin/bash
set -e
set -x

docker container prune --force
docker image prune -f

API_IMAGE_ID="$(docker images $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-api:latest --format {{.ID}})"
CLIENT_IMAGE_ID="$(docker images $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-client:latest --format {{.ID}})"
INSTANCESERVER_IMAGE_ID="$(docker images $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-instanceserver:latest --format {{.ID}})"
TASKSERVER_IMAGE_ID="$(docker images $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-taskserver:latest --format {{.ID}})"
TESTBOT_IMAGE_ID="$(docker images $DESTINATION_REPO_URL/$DESTINATION_REPO_NAME_STEM-testbot:latest --format {{.ID}})"

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
