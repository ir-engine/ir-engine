set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --install --reuse-values --set builder.image.tag=$TAG,builder.extraENV.DOCKER_USERNAME=$DOCKER_USERNAME,builder.extraEnv.DOCKER_HUB_PASSWORD=$DOCKER_HUB_PASSWORD $STAGE-builder xrengine/xrengine-builder
