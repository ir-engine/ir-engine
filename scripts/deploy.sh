set -e
set -x

TAG=$1
STAGE=$1

helm upgrade --reuse-values --set server.image.tag=$TAG $STAGE xrchat/xrchat