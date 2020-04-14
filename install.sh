set -e
set -x

sudo apt-get update
sudo apt-get install apt-transport-https
sudo apt-get upgrade

./install_minikube.sh

./install_kubectl.sh

./install_helm.sh

helm repo add nginx-stable https://helm.nginx.com/stable
helm repo add stable https://kubernetes-charts.storage.googleapis.com

helm repo update
helm install nginx1 nginx-stable/nginx-ingress

aws eks describe-cluster --name kaixr-production > ~/.kube/kaixr.yaml
export KUBECONFIG=/home/${USER}/.kube/kaixr.yaml


export KUBECONFIG=/home/${USER}/.kube/xrk-kubeconfig.yaml
echo $KUBECONFIG
sudo snap install kubectl --classic
sudo snap install helm --classic

# get dependencies
helm dep update xrchat

helm install --dry-run --debug test xrchat > x.yaml
helm install --dry-run --debug --values configs/local.values.yaml test xrchat > x.yaml

helm upgrade --install  --values configs/prod-values.yaml beta xrchat 