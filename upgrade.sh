set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE xrchat/xrchat --values configs/$RELEASE.values.yaml
