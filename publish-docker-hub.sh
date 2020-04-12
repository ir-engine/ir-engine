
set -e
# before you run this you need to run 
# $ source .xrchat-secrets to load tokens and passwords

docker-compose build
docker login --username xrchat --password ${DOCKER_HUB_TOKEN}

docker tag xrchat/server xrchat/server:latest
docker push xrchat/server:latest 

docker tag xrchat/realtime-server xrchat/realtime-server:latest
docker push xrchat/realtime-server:latest

docker tag xrchat/client xrchat/client:latest
docker push xrchat/client:latest
