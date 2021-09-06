set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --reuse-values --set analytics.image.tag=$TAG,api.image.tag=$TAG,gameserver.image.tag=$TAG,media.image.tag=$TAG,client.image.tag=$TAG $STAGE xrengine/xrengine
