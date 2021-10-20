set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE xrengine/xrengine --values values/$RELEASE.values.yaml
