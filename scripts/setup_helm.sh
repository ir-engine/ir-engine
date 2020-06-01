set -e
set -x

sudo snap install kubectl --classic

sudo snap install helm --classic

helm repo add xrchat https://xr3ngine.github.io/xrsocial-ops/

helm repo update

set +x
