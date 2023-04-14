#!/bin/bash
set -e
set -x

TAG=$1
CLEAN=$2

if [ -z "$REGISTRY_HOST" ]
then
  REGISTRY_HOST=localhost
else
  REGISTRY_HOST=$REGISTRY_HOST
fi

if [ -z "$MYSQL_HOST" ]
then
  MYSQL_HOST=localhost
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
  MYSQL_DATABASE=etherealengine
else
  MYSQL_DATABASE=$MYSQL_DATABASE
fi

if [ -z "$VITE_APP_HOST" ]
then
  VITE_APP_HOST=local.etherealengine.org
else
  VITE_APP_HOST=$VITE_APP_HOST
fi

if [ -z "$VITE_SERVER_HOST" ]
then
  VITE_SERVER_HOST=api-local.etherealengine.org
else
  VITE_SERVER_HOST=$VITE_SERVER_HOST
fi

if [ -z "$VITE_FILE_SERVER" ]
then
  VITE_FILE_SERVER=https://localhost:8642
else
  VITE_FILE_SERVER=$VITE_FILE_SERVER
fi

if [ -z "$VITE_MEDIATOR_SERVER" ]
then
  VITE_MEDIATOR_SERVER=https://authn.io
else
  VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER
fi

if [ -z "$VITE_INSTANCESERVER_HOST" ]
then
  VITE_INSTANCESERVER_HOST=instanceserver-local.etherealengine.org
else
  VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST
fi

if [ -z "$VITE_LOGIN_WITH_WALLET" ]
then
  VITE_LOGIN_WITH_WALLET=false
else
  VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET
fi

if [ -z "$VITE_8TH_WALL" ]
then
  VITE_8TH_WALL=null
else
  VITE_8TH_WALL=$VITE_8TH_WALL
fi

if [ -z "$NODE_ENV" ]
then
  NODE_ENV=development
else
  NODE_ENV=$NODE_ENV
fi

docker start etherealengine_minikube_db

mkdir -p ./project-package-jsons/projects/default-project
cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project
find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;

if [ "$CLEAN" ]
then
  echo "Cleaning docker"

  docker system prune --force
fi

if [ -z "$TAG" ]
then
  TAG="latest"
fi

echo "Tag is: $TAG"

# DOCKER_BUILDKIT=1 docker build -t $REGISTRY_HOST:32000/root-builder -f dockerfiles/package-root/Dockerfile-root .

# docker tag $REGISTRY_HOST:32000/root-builder $REGISTRY_HOST:32000/root-builder:$TAG
# docker push $REGISTRY_HOST:32000/root-builder:$TAG

DOCKER_BUILDKIT=1 docker build --network=host -t $REGISTRY_HOST:32000/etherealengine \
  --build-arg NODE_ENV=$NODE_ENV \
  --build-arg MYSQL_HOST=$MYSQL_HOST \
  --build-arg MYSQL_PORT=$MYSQL_PORT \
  --build-arg MYSQL_PASSWORD=$MYSQL_PASSWORD \
  --build-arg MYSQL_USER=$MYSQL_USER \
  --build-arg MYSQL_DATABASE=$MYSQL_DATABASE \
  --build-arg VITE_APP_HOST=$VITE_APP_HOST \
  --build-arg VITE_SERVER_HOST=$VITE_SERVER_HOST \
  --build-arg VITE_FILE_SERVER=$VITE_FILE_SERVER \
  --build-arg VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER \
  --build-arg VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST \
  --build-arg VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL \
  --build-arg VITE_DISABLE_LOG=$VITE_DISABLE_LOG \
  --build-arg VITE_8TH_WALL=$VITE_8TH_WALL \
  --build-arg VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET .

docker tag $REGISTRY_HOST:32000/etherealengine $REGISTRY_HOST:32000/etherealengine:$TAG
docker push $REGISTRY_HOST:32000/etherealengine:$TAG

# DOCKER_BUILDKIT=1 docker build -t $REGISTRY_HOST:32000/etherealengine-testbot -f ./dockerfiles/testbot/Dockerfile-testbot .

# docker tag $REGISTRY_HOST:32000/etherealengine-testbot $REGISTRY_HOST:32000/etherealengine-testbot:$TAG
# docker push $REGISTRY_HOST:32000/etherealengine-testbot:$TAG
