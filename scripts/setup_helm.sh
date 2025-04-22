set -e
set -x

apt-get -y update

apt-get -y install apt-transport-https ca-certificates curl gnupg lsb-release build-essential

#install kubectl
curl -LO "https://dl.k8s.io/release/v1.23.6/bin/linux/amd64/kubectl"
install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

#install Helm
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh

helm repo add ir-engine https://helm.etherealengine.org

helm repo update
set +x
