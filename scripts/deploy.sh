set -e
set -x

STAGE=$1
TAG=$2

helm upgrade --reuse-values --set server.image.tag=$TAG $STAGE xrchat/xrchat