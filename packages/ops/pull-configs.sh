set -x

RELEASE=$1

helm get values $RELEASE -o yaml > values/$RELEASE.values.yaml
