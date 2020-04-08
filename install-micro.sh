sudo snap install microk8s --classic
# sudo snap alias microk8s.kubectl kubectl
sudo usermod -a -G microk8s $USER
echo "logout to be able to access this without sudo"
microk8s.status --wait-ready
microk8s.kubectl get nodes
microk8s.kubectl get services
microk8s.kubectl get all --all-namespaces
microk8s.kubectl get no
microk8s.enable dns dashboard registry
microk8s.kubectl config view --raw > $HOME/.kube/config
