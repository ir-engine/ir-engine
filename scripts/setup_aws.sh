set -e
set -x

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

set +x

aws configure list
echo setting access_key
aws configure set aws_access_key_id $1
echo setting secret_key
aws configure set aws_secret_access_key $2
aws configure list
echo setting region
aws configure set default.region $3

aws configure list
echo updating kubeconfig
aws eks update-kubeconfig --name $4
aws configure list
echo finished setup_aws