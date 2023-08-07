set -e
set -x

STAGE=$1
TAG=$2
EEVERSION=$(jq -r .version ./packages/server-core/package.json)

DEPLOYED=$(helm history dev-builder | grep deployed)
REGEX='etherealengine-builder-([0-9]+.[0-9]+.[0-9]+)'
[[ $DEPLOYED =~ $REGEX ]]
VERSION=${BASH_REMATCH[1]}

kubectl delete job --ignore-not-found=true "${STAGE}-builder-etherealengine-builder" && helm upgrade --install --reuse-values --version $VERSION --set builder.image.tag="${EEVERSION}_${TAG}" $STAGE-builder etherealengine/etherealengine-builder
