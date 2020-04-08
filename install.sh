set -e
set -x

sudo apt-get update
sudo apt-get install apt-transport-https
sudo apt-get upgrade

./install_minikube.sh

./install_kubectl.sh

./install_helm.sh