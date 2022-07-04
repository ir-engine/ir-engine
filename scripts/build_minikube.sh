#!/bin/bash
set -e
set -x

if [ -z "$MYSQL_HOST" ]
then
  MYSQL_HOST=host.minikube.internal
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

if [ -z "$VITE_CLIENT_HOST" ]
then
  VITE_CLIENT_HOST=local.theoverlay.io
else
  VITE_CLIENT_HOST=$VITE_CLIENT_HOST
fi

if [ -z "$VITE_SERVER_HOST" ]
then
  VITE_SERVER_HOST=api-local.theoverlay.io
else
  VITE_SERVER_HOST=$VITE_SERVER_HOST
fi

if [ -z "$VITE_MEDIATOR_SERVER" ]
then
  VITE_MEDIATOR_SERVER=https://authn.io
else
  VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER
fi

if [ -z "$VITE_INSTANCESERVER_HOST" ]
then
  VITE_INSTANCESERVER_HOST=instanceserver-local.theoverlay.io
else
  VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST
fi

if [ -z "$NODE_ENV" ]
then
  NODE_ENV=development
else
  NODE_ENV=$NODE_ENV
fi

docker start xrengine_minikube_db
eval $(minikube docker-env)

mkdir -p ./project-package-jsons/projects/default-project
cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project
find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;

DOCKER_BUILDKIT=1 docker build -t root-builder -f dockerfiles/package-root/Dockerfile-root .

DOCKER_BUILDKIT=1 docker build -t xrengine \
  --build-arg NODE_ENV=$NODE_ENV \
  --build-arg MYSQL_HOST=$MYSQL_HOST \
  --build-arg MYSQL_PORT=$MYSQL_PORT \
  --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
  --build-arg MYSQL_USER=$MYSQL_USER \
  --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
  --build-arg VITE_CLIENT_HOST=$VITE_CLIENT_HOST \
  --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
  --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
  --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST .

DOCKER_BUILDKIT=1 docker build -t xrengine-testbot -f ./dockerfiles/testbot/Dockerfile-testbot .