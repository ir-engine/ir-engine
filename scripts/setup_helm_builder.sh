set -e
set -x

sudo apt-get -y update

#install kubectl
curl -LO "https://dl.k8s.io/release/v1.23.6/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

#install Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh


helm repo add xrengine https://helm.xrengine.io

helm repo update

set +x
