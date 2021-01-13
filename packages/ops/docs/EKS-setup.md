# Setting up XR3ngine on AWS

## Create EKS cluster
You first need to set up an EKS cluster for XR3ngine to run on.
While this can be done via AWS' web interface, the ```eksctl``` CLI 
will automatically provision more of the services you need automatically,
and is thus recommended.

First, follow [these instructions](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)
for setting up aws-cli, eksctl, and configuring aws-cli with your AWS credentials.
You should also set up kubectl and Helm, as we will be using that to install multiple codebases from Charts.

Next run the following command:

```eksctl create cluster --name <name> --version <version> --region <region> --managed --nodegroup-name <name> --node-type <instance type> --nodes <target_node_number> --nodes-min <minimum_node_number> --nodes-max <maximum_node_number>```

This will create an EKS cluster with managed nodes in the specified region, including automatically
creating AZs, making a VPC, and more. It may take up to 15 minutes to complete.

Note that the region matters for almost all services in AWS. The default region is 'us-east-1',
but if you make the cluster in any other region, you'll need to make sure you're creating certs,
DNS records, etc. in the same region.

As of this writing, the API and client are configured to run on a nodegroup named 'ng-1'.
If you name it something else, be sure to change the NodeAffinity in the configuration file.

Make sure to increase the maximum node limit, as by default target, minimum, and maximum are
set to 2, and XR3ngine's setup will definitely need more than two nodes if you've configured
them to use relatively small instance types such as t3a.medium.

### Create nodegroup for gameservers

Once the cluster is set up, you should create a second nodegroup for gameservers.
While this isn't strictly necessary, and they could run on the initial nodegroup, it
can be useful to have them running on a different group; there's no conflict for
resources with the other server types, and you can specify more powerful instance types
if needed.

Go to the AWS website, then go to EKS -> Clusters -> click on the cluster you just made -> Configuration -> Compute.
You should see one managed nodegroup already there; clicking on its name will open up information
and editing, though you can't change the instance type after it's been made.

Back at the Compute tab, click on Add Node Group. Pick a name, select the IAM role that was
created with the cluster (it should be something like ```eksctl-<cluster_name>-node-NodeInstanceRole-<jumble_of_characters>``),
toggle the Use Launch Template toggle and select the launch template used to make the initial nodegroup,
then click Next. On the second page, Choose the instance type(s) you'd like for the group,
set the minimum/maximum/desired scaling sizes, and hit Next. The default subnets should be fine,
so hit Next, review everything, and click Create.

## Edit security group to allow gameserver traffic
You'll need to edit the new cluster's main security group to allow gameserver traffic.
On the AWS web client, go to EC2 -> Security Groups. There should be three SGs that have
the node's name somewhere in there name; look for the one that is in the form
```eks-cluster-sg-<cluster_name>-<random_numbers>```. It should NOT end with /ControlPlaneSecurityGroup
or /ClusterSharedNodeSecurityGroup.
Click on that, then the Inbound Rules tab, then click Edit Inbound Rules.

You'll need to add two rule sets:
* Type: Custom UDP; Port Range 30000-32767; Source: Custom 0.0.0.0/0
* Type: Custom TCP; Port Range 7000-8000; Source: Custom 0.0.0.0/0

## Create Route 53 Hosted Zone and set up ACM certificates

Before installing Nginx to the cluster, you'll need to have all of the networking squared away.
This requires creating the necessary SSL certificates and creating some DNS records to point 
various subdomains to the right place.

### Create Route 53 Hosted Zone
In the AWS web client, go to Route 53. Make a hosted zone for the domain you plan to use for
your setup of XR3ngine. You'll be coming back here later to create DNS records.

### Create certificates with ACM

Go to Amazon Certificate Manager. If there are no certs in that region, click on Get Started under Provision Certificates,
otherwise click on Request a Certificate.

You should select Request a Public Certificate, then select Request a Certificate. The next page
should be headed Add Domain Names. You should add both the top-level domain, such as ```xr3ngine.io```, 
as well as a wildcard for all subdomains e.g. ```*.xr3ngine.io```, then click Next.

Choose DNS Validation on the next page and click Next. You can skip adding tags and just click Review,
then Confirm on the final page.

You should be sent to a page headed Validation. Click on the arrow next to each domain to open more
options. Click on the button Create Record in Route 53 to open a confirmation modal, and in that modal
click Create.

As it indicates, it can take up to 30 minutes for these domains to be validated. If you click on Complete
after triggering the record creation for each of them, you should be sent back to the Certificates page.
Opening the cert you just made will show the validation status of each domain.

If you open the details of this certificate, there should be a field 'ARN' with a value that looks
something like ```arn:aws:acm:<region>:<AWS account ID>:certificate/<a UUID>```. Take note of this for later,
when you go to install ingress-nginx.

You should follow the above instructions to make a second certificate for ```resources.<domain>```.
Note that this certificate MUST be made in us-east-1, regardless of which region everything else is
set up in; as of this writing, CloudFront can only use certificates in us-east-1.

## Install Agones and ingress-nginx

Now that the cluster is up and running, we can install everything onto it.
When you created the cluster with eksctl, it should have created a context pointing to
it in kubectl. Run ```kubectl config get-contexts``` to get all of the contexts it knows about;
the one with a star next to it should be named ```<your_AWS_username>@<cluster_name>```.
If that isn't present, you'll have to edit the configuration to make the appropriate context.

You next need to add the Agones and ingress-nginx Helm charts to helm by running 
```helm repo add agones https://agones.dev/chart/stable``` and ```helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx```.
You should also at this time add XR3ngine's repo via ```helm repo add xr3ngine https://school.xrengine.io```.

If you ever suspect that a chart is out-of-date, run ```helm repo update``` to update all of them to the latest.

### Install Agones
From the top level of this repo, run ```helm install -f ./packages/ops/configs/agones-default-values.yaml agones agones/agones```.
This says to install a service called 'agones' from the 'agones' package in the 'agones' chart, and to configure it with
a file found at /packages/ops/configs/agones-default-values.yaml.

### Install ingress-nginx
Open the file ```packages/ops/configs/nginx-ingress-aws-values.yml```. Take note of the line
```service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "<ACM Certificate ARN for SSL>"```
Replace the bit in angle brackets, including the angle brackets, with the ARN of the certificate
you made for the top-level domain and all wildcarded subdomains, e.g.
```service.beta.kubernetes.io/aws-load-balancer-ssl-cert: "arn:aws:acm:us-west-1:103947711118:certificate/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"```

Do not commit this file with the ARN inserted; once you've completed this step, revert the file back
to the state it was committed in.

From the top level of this repo, run ```helm install -f ./packages/ops/configs/nginx-ingress-aws-values.yml nginx ingress-nginx/ingress-nginx```
This says to install a service called 'nginx' from the 'ingress-nginx' package in the 'ingress-nginx' chart, and to configure it with
a file found at /packages/ops/configs/nginx-ingress-aws-values.yml.

## Upgrade Classic LoadBanacer to Application LoadBalancer

By default, Kubernetes LoadBalancer Services will create Classic LoadBalancers in AWS.
There are features of Application LoadBalancers we'd like to have though.
In the AWS web client, go to EC2 -> Load Balancing -> Load Balancers.
There should be one Classic loadbalancer there. If there are others from other projects,
find the one that the cluster just made; clicking through to its VPC should show whether
it's the one you're looking for (the VPC should be named ```eksctl-<cluster_name>-cluster```).

When you've highlighted the correct LB, click on the tab Migration, then click the button
Launch ALB Migration Wizard. You shouldn't have to select anything on the page that comes
up, just hit Create and then Close once it finishes.

When you go back to the Load Balancer list, make note of the DNS name of the Application
loadbalancer you just created. It should be similar to the name of the classic one.

Highlight the new ALB and click on the Listeners tab. Select the HTTPS:443 listener and click Edit.
There should be one entry under Default Action(s), and it should be Forward To <ID of both load balancers>.
Click the pencil icon on the left to edit it, then open the accordion for Group-Level Stickiness,
check the checkbox next to Enable Up To and switch 'hours' to 'days', leaving it as 'Enable up to 1 days'.
(Several hours would also be an acceptable setting; we just don't want connections to time out after an hour).
Click the checkmark at the bottom of this accordion, then the Update button near the top of the screen.

## Set up Simple Email Service

You need to set up Simple Email Service so that login links can be sent.

In the AWS web client, go to SES -> Domains. Click Verify a New Domain, then enter the top-leve
domain and check the box for Generate DKIM Settings, then click Verify This Domain.
On the modal that pops up, there should be a button to create all the records in Route 53;
click it. Then click Close.

## Set up Simple Notification service
SNS is used to send text messages from the XR3ngine platform.

In the AWS web client, go to SNS -> Topics and Create a new topic.
Give it a name, and selected 'Standard' as the type, then click Create Topic.

## Set up S3 bucket for static resources and Cloudfront distribution

Various static files are stored in S3 behind a Cloudfront distribution.

### Create S3 bucket
In the AWS web client, go to S3 -> Buckets and click Create Bucket.
Name the bucket <name>-static-resources, e.g. ```xr3ngine-static-resources```.
You don't need it to be in the same region as your cluster, but it helps.
Uncheck the checkbox Block *all* Public Access; you need the bucket to be publicly accessible.
Check the box that pops up confirming that you know the contents are public.
All other settings can be left to their default values; click Create Bucket.

Open the bucket's settings and go the Permissions tab. At the bottom is a 
Cross-origin Resource Sharing (CORS) box. It should have the following settings; if not, click
Edit and copy this in:
```
[
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "HEAD",
            "GET"
        ],
        "AllowedOrigins": [
            "*"
        ],
        "ExposeHeaders": []
    }
]
```

### Create Cloudfront distribution
In the AWS web client, go to Cloudfront -> Distributions and click on Create Distribution.
Under 'Web', click on Get Started.

Under Origin Settings, click on the box next to Origin Domain Name, and select the name of the S3 bucket you just made.

Under Default Cache Behavior Settings, Allowed HTTP Methods should be set to 'GET, HEAD, OPTIONS'.
Cache and origin request settings should be left on 'Use a cache policy and origin request policy'.
For Origin Request Policy, select 'Managed-CORS-S3Origin'

Under Distribution Settings, you can change Price Class to 'Use Only U.S. Canada and Europe' to save some money.
For Alternate Domain Names, enter 'resources.<domain>', e.g. ```resources.xr3ngine.io```.
For SSL Certificate, select Custom SSL Certificate, then when you click on the box, choose
the 'resources.<domain>' certificate you made earlier.

Everything else can be left at the default values, click Create Distribution.

## Set up DNS records

In the AWS web client, go to Route 53, then go into the Hosted Zone you made earlier.
Click on Create Record. If it starts you under Quick Create Record, click the link
'Switch to Wizard'; it's not necessary, but the wizard is handy.

Under Routing Policy, leave it on Simple Routing and click Next. Then click Define Simple Record.

The first record should be for the top-level domain, e.g. ```xr3ngine.io```, so leave the Record Name
text field blank. Under Value/Route Traffic To, click on the dropdown and select
Alias to Application and Classic Load Balancer. Select the region that your cluster is in.
Where it says Choose Load Balancer, click the dropdown, and select the Application loadbalancer.
Leave the Record Type as 'A - Route traffic to an IPv4 address and some AWS resources', then click
Define Simple Record.

You can keep clicking Define Simple Record to make more records in one batch. When you're
done, click Create Records.

You should make the following 'A' records to the loadbalancer, substituting your domain for 'xr3ngine.io':

* xr3ngine.io
* *.xr3ngine.io
* @.xr3ngine.io
* api-dev.xr3ngine.io
* api.xr3ngine.io
* dev.xr3ngine.io

You also need to make an 'A' record pointing 'resources.xr3ngine.io' to the CloudFront distribution you made earlier.

## Deploy to EKS using Helm

With all of the networking set up, you can finally deploy the codebase to EKS.
You should have a .yaml file with various configuration variables specified for your deployment.
The Helm chart will pull a Docker image from the lagunalabs/xrengine Docker Hub account.
There's a CI/CD pipeline attached to the XR3ngine GitHub account that builds every
time the dev and master branches are updated, and tags each build with the GitHub SHA
of the latest commit. You'll have to provide this SHA as part of the configuration, most
easily as one-off settings as demonstrated below.

Run ```helm install -f </path/to/config.yaml> --set api.image.tag=<latest_github_commit_SHA>,client.image.tag=<latest_github_commit_SHA>,gameserver.image.tag=<latest_github_commit_SHA> <stage_name> xr3ngine/xr3ngine```

After a minute or so, all of the pods should be up and running, and you should be able to
go to the root domain you have this deployment running on and see something.