set -x

RELEASE=$1

helm get values $RELEASE -o yaml > configs/$RELEASE.values.yaml
