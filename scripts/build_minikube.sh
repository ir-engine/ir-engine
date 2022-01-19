#!/bin/bash
set -e
set -x

if [ -z "$MYSQL_HOST" ]
then
  MYSQL_HOST=10.0.2.2
else
  MYSQL_HOST=$MYSQL_HOST
fi

if [ -z "$MYSQL_PORT" ]
then
  MYSQL_PORT=3304
else
  MYSQL_PORT=$MYSQL_PORT
fi

if [ -z "$MYSQL_USER" ]
then
  MYSQL_USER=server
else
  MYSQL_USER=$MYSQL_USER
fi

if [ -z "$MYSQL_PASSWORD" ]
then
  MYSQL_PASSWORD=password
else
  MYSQL_PASSWORD=$MYSQL_PASSWORD
fi

if [ -z "$MYSQL_DATABASE" ]
then
  MYSQL_DATABASE=xrengine
else
  MYSQL_DATABASE=$MYSQL_DATABASE
fi

docker start xrengine_minikube_db
eval $(minikube docker-env)
DOCKER_BUILDKIT=1 docker build -t xrengine --build-arg MYSQL_HOST=$MYSQL_HOST --build-arg MYSQL_PORT=$MYSQL_PORT --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD --build-arg MYSQL_USER=$MYSQL_USER --build-arg MYSQL_DATABASE=$MYSQL_DATABASE .

DOCKER_BUILDKIT=1 docker build -t xrengine-testbot -f ./dockerfiles/testbot/Dockerfile-testbot .