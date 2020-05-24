set -e
set -x

sudo snap install kubectl --classic

sudo snap install helm --classic

helm repo add xrengine https://xrengine.github.io/xrengine-ops/

helm repo update

set +x