set -e
set -x

# https://askubuntu.com/a/980632/1558816
sudo apt-get -y clean
sudo rm -rf /var/lib/apt/lists/*
sudo apt-get -y clean
sudo apt-get -y update
sudo apt-get -y upgrade

#install kubectl
curl -LO "https://dl.k8s.io/release/v1.23.6/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

#install Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

helm repo add etherealengine https://helm.etherealengine.org

helm repo update

set +x
