set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --install --reuse-values --set builder.image.tag=$TAG $STAGE-builder xrengine/xrengine-builder
