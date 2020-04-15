# Deploying XRChat Platform on AWS EKS

## Connect to your cluster

First install AWS CLI, Helm and Kubectl
``` bash
# install Helm and Kubectl
sudo snap install kubectl --classic
sudo snap install helm --classic

# Install AWS CLI v2, for Windows and Mac users: https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html 
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install 

```

Now load your cluster config
``` bash
aws eks --region <us-east-1> update-kubeconfig --name <cluster-name> 
```

## Prepare your cluster

### Create HTTPs certificate

Create a certificate if needed using UI or CLI for your domain with wildcard subdomains `*.domain.com`
``` bash
aws acm request-certificate \
--domain-name *.domain.com \
--validation-method DNS \
--idempotency-token 1234 \
--options CertificateTransparencyLoggingPreference=DISABLED --output text)

```
Then store the result CertificateArn into 


### Create Load Balancer and Ingress Controller 
You need Nginx-Ingress controller.
**Warning**: This step will spin up an ALB (Application Load Balancer), which will incure some cost.

Create a values file like this: 
An actual file exists at [/configs/nginx-ingress-aws-values.yml](/configs/nginx-ingress-aws-values.yml)

``` yaml
# values for nginx-ingress on EKS using Classic ALP

rbac:
  create: true

controller:
  config:
    ssl-redirect: "true" # Redirect Insecure traffic to Https
  service:
    targetPorts:
      http: http
      https: http # SSL termination at the load balancer
    annotations:
      service.beta.kubernetes.io/aws-load-balancer-ssl-ports: "443"
      service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "<ACM Certificate ARN for SSL>"
```

Then install the nginx-ingress using the values file you created
``` bash
helm install nginx --values configs/nginx-ingress-aws-values.yml stable/nginx-ingress
```
