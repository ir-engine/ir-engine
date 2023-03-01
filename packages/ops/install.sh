set -e
set -x

sudo snap install kubectl --classic
sudo snap install helm --classic

helm repo add nginx-stable https://helm.nginx.com/stable
helm repo add stable https://kubernetes-charts.storage.googleapis.com
helm repo update
helm install nginx1 nginx-stable/nginx-ingress

aws eks describe-cluster --name etherealengine-demo > ~/.kube/etherealengine.yaml
export KUBECONFIG=/home/${USER}/.kube/etherealengine.yaml
echo $KUBECONFIG

# get dependencies
helm dep update etherealengine
