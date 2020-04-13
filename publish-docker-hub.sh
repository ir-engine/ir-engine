
set -e
# before you run this you need to run 
# $ source .xrchat-secrets to load tokens and passwords

cd ../xrchat-client

git fetch --tags
TAG="$(git describe --abbrev=0 --tags)"

cd ../xrchat-ops


docker-compose -f docker-compose-local.yml build
docker login --username xrchat --password ${DOCKER_HUB_TOKEN}


for repo in {client,server,realtime-server}; do
    for tag in {$TAG,latest}; do
        docker tag xrchat/${repo} xrchat/${repo}:${tag}
        docker push xrchat/${repo}:${tag}
    done
done 


# docker tag xrchat/server xrchat/server:latest
# docker push xrchat/server:latest 

# docker tag xrchat/realtime-server xrchat/realtime-server:latest
# docker push xrchat/realtime-server:latest

# docker tag xrchat/client xrchat/client:latest
# docker push xrchat/client:latest
