
set -e
# before you run this you need to run 
# $ source .xr3ngine-secrets to load tokens and passwords

cd ../client

git fetch --tags
TAG="$(git describe --abbrev=0 --tags)"

cd ../ops

export NEW_TAG=rc0.0.5
docker-compose -f docker-compose-local.yml build
docker login --username xr3ngine --password ${DOCKER_HUB_PASSWORD}

for repo in {client,server,realtime-server}; do
    for tag in {$TAG,latest}; do
        docker tag xr3ngine/${repo} xr3ngine/${repo}:${tag}
        docker push xr3ngine/${repo}:${tag}
    done
done 


# docker tag xr3ngine/xrsocial xr3ngine/xrsocial:latest
# docker push xr3ngine/xrsocial:latest 

# docker tag xr3ngine/xrsocial-realtime-server xr3ngine/xrsocial-realtime-server:latest
# docker push xr3ngin/xrsocial-realtime-server:latest

# docker tag xr3ngine/xrsocial-client xr3ngine/xrsocial-client:latest
# docker push xr3ngine/xrsocial-client:latest

# docker tag xr3ngine/xrsocial-client xr3ngine/xrsocial-client:${NEW_TAG}
# docker push xr3ngine/xrsocial-client:${NEW_TAG}
