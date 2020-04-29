set -x

RELEASE=$1

helm get values $RELEASE > configs/$RELEASE.values.yaml
