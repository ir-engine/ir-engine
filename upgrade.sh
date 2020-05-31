set -x

RELEASE=$1

helm repo update

helm upgrade --install $RELEASE xr3ngine/xr3ngine --values values/$RELEASE.values.yaml
