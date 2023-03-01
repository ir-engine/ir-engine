set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE etherealengine/etherealengine --values values/$RELEASE.values.yaml
