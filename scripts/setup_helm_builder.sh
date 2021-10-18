set -e
set -x

sudo apt-get -y update
sudo apt-cache madison snapd
sudo apt-get install -y snapd

sudo snap install kubectl --classic

sudo snap install helm --classic

helm repo add xrengine https://helm.xrengine.io

helm repo update

set +x
