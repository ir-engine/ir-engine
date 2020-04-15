sudo snap install microk8s --classic
# sudo snap alias microk8s.kubectl kubectl
sudo usermod -a -G microk8s $USER
sudo microk8s.status --wait-ready
sudo microk8s.kubectl get nodes
sudo microk8s.kubectl get services
sudo microk8s.kubectl get all --all-namespaces
sudo microk8s.kubectl get no
sudo microk8s.enable dns dashboard registry
sudo microk8s.kubectl config view --raw > $HOME/.kube/config

echo "logout to be able to access this without sudo"