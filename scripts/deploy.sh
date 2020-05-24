set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --reuse-values --set client.image.tag=$TAG $STAGE xrengine/xrengine