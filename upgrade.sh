set -x

RELEASE=$1

helm upgrade --install $RELEASE ./xrchat --values configs/$RELEASE.values.yaml
