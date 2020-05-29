set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --reuse-values --set api.image.tag=$TAG,media.image.tag=$TAG $STAGE xrchat/xrchat