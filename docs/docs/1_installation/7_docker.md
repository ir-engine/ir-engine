# Old Docker Instructions

You can quickstart locally using docker, if you don't have node installed or
just want to test the latest.

## Get local IP address
Use a tool like ifconfig to get your local IP address.

## Start local databases

```bash
cd scripts
docker-compose up
```

When the logging stops, that indicates that the databases have been created and
are running.

Ctrl+c out of that, then from scripts run `./start-all-docker.sh`
(This must be run every time you start your machine anew)

## Build the image

Create an empty folder at the root called `project-package-jsons` and the run
the following command to build:

``` bash
DOCKER_BUILDKIT=1 docker build -t xrengine --build-arg MYSQL_USER=server \
  --build-arg MYSQL_PASSWORD=password --build-arg MYSQL_HOST=127.0.0.1 \
  --build-arg MYSQL_DATABASE=xrengine --build-arg MYSQL_PORT=3304 \
  --build-arg VITE_SERVER_HOST=localhost --build-arg VITE_SERVER_PORT=3030 \
  --build-arg VITE_GAMESERVER_HOST=localhost --build-arg VITE_GAMESERVER_PORT=3031 \
  --build-arg VITE_LOCAL_BUILD=true --build-arg CACHE_DATE="$(date)" --network="host" .
```

## Run the server to seed the database, wait a couple minutes, then delete it

``` bash
docker run -d --name server --env-file .env.local.default -e "SERVER_MODE=api" -e "FORCE_DB_REFRESH=true" --network host xrengine
docker logs server -f
-Wait for the line "Server Ready", then Ctrl+c out of the logs-
docker container stop server
docker container rm server
```

## Run the images
``` bash
docker run -d --name serve-local --env-file .env.local.default -e "SERVER_MODE=serve-local" --network host xrengine
docker run -d --name server --env-file .env.local.default -e "SERVER_MODE=api" -e "GAMESERVER_HOST=<local IP address" --network host xrengine
docker run -d --name client --env-file .env.local.default -e "SERVER_MODE=client" --network host xrengine
docker run -d --name world --env-file .env.local.default -e "SERVER_MODE=realtime" -e "GAMESERVER_HOST=<local IP address>" --network host xrengine
docker run -d --name channel --env-file .env.local.default -e "SERVER_MODE=realtime" -e "GAMESERVER_HOST=<local IP address>" -e "GAMESERVER_PORT=3032" --network host xrengine
```

## Delete containers, if you want to run a new build, or just get rid of them

``` bash
docker container stop serve-local
docker container rm serve-local
docker container stop server
docker container rm server
docker container stop client
docker container rm client
docker container stop world
docker container rm world
docker container stop channel
docker container rm channel
```
