set -e
set -x

curl --output temp-helm.tar.gz  https://get.helm.sh/helm-v3.1.2-linux-amd64.tar.gz
tar -zxvf temp-helm.tar.gz
sudo mv linux-amd64/helm /usr/local/bin/helm
rm -rf linux-amd64
rm temp-helm.tar.gz
echo "source <(helm completion bash)" >> ~/.bashrc
