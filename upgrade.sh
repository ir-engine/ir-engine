set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE xrchat/xrchat --values values/$RELEASE.values.yaml
