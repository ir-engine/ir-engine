# Setting up XREngine on AWS

## Create EKS cluster
You first need to set up an EKS cluster for XREngine to run on.
While this can be done via AWS' web interface, the ```eksctl``` CLI 
will automatically provision more of the services you need automatically,
and is thus recommended.

First, follow [these instructions](https://docs.aws.amazon.com/eks/latest/userguide/getting-started-eksctl.html)
for setting up aws-cli, eksctl, and configuring aws-cli with your AWS credentials.
You should also set up kubectl and Helm, as we will be using that to install multiple codebases from Charts.

Next run the following command:

```eksctl create cluster --name <name> --version <version> --region <region> --managed --nodegroup-name <name> --node-type <instance type> --nodes <target_node_number> --nodes-min <minimum_node_number> --nodes-max <maximum_node_number>```

This will create an EKS cluster with managed nodes in the specified region, including automatically
creating subnets, making a VPC, and more. It may take up to 15 minutes to complete.

You can also use the flag ```--zones <zone1>,<zone2>``` to specify which Availability Zones the cluster
should set up in. Some regions have zones that are unavailable, but which eksctl will try to
use if --zones is not specified, leading to the setup to fail. As an example, us-west-1 (as of this
writing) does not have any resources available in us-west-1b; if you are setting up in us-west-1,
you would want to use ```--zones us-west-1a,us-west-1c```.

Note that the region matters for almost all services in AWS. The default region is 'us-east-1',
but if you make the cluster in any other region, you'll need to make sure you're creating certs,
DNS records, etc. in the same region.

As of this writing, the API and client are configured to run on a nodegroup named 'ng-1'.
If you name it something else, be sure to change the NodeAffinity in the configuration file.

Make sure to increase the maximum node limit, as by default target, minimum, and maximum are
set to 2, and XREngine's setup will definitely need more than two nodes if you've configured
them to use relatively small instance types such as t3a.medium.

#### Create launch template
Go to EC2 -> Launch Templates and make a new one. Name it something like 'xrengine-production-gameserver'.
Most settings can be left as-is, except for the following:
* Storage -> Add a volume, set the size to ~20GB, and for Device name select '/dev/xvda'.
* Network Interfaces -> Add one, and under 'Auto-assign public IP' select 'Enable'

#### Create nodegroup for gameservers
Go to the AWS website, then go to EKS -> Clusters -> click on the cluster you just made -> Configuration -> Compute.
You should see one managed nodegroup already there; clicking on its name will open up information
and editing, though you can't change the instance type after it's been made.

Back at the Compute tab, click on Add Node Group. Pick a name (something like ng-gameservers-1 is recommended),
select the IAM role that was created with the cluster (it should be something like ```eksctl-<cluster_name>-node-NodeInstanceRole-<jumble_of_characters>``),
toggle the Use Launch Template toggle and select the launch template you made in the previous step,
then click Next. On the second page, Choose the instance type(s) you'd like for the group,
set the minimum/maximum/desired scaling sizes, and hit Next (t3(a).smalls are recommended). 
There may be connection issues with gameserver instances in private subnets, so remove all of the public
subnets from the list of subnets to use, and make sure that public subnets are being used (sometimes
the workflow only selects private subnets by default). Hit Next, review everything, and click Create.

### Create nodegroup for redis

redis should get its own nodegroup to isolate it from any other changes that might be made to your cluster.
As with the gameserver nodegroup, it's not strictly necessary, but can prevent various other things from
going down due to the redis servers getting interrupted.

Back at the Compute tab, click on Add Node Group. Pick a name (the default config in packages/ops/config assumes
a name of 'ng-redis-1'), select the IAM role that was created with the cluster 
(it should be something like ```eksctl-<cluster_name>-node-NodeInstanceRole-<jumble_of_characters>``),
toggle the Use Launch Template toggle and select the launch template used to make the initial nodegroup,
then click Next. On the second page, Choose the instance type(s) you'd like for the group,
set the minimum/maximum/desired scaling sizes, and hit Next (You can probably get away with a single t3(a).small). 
The default subnets should be fine, so hit Next, review everything, and click Create.

## Create IAM Roles for S3/SES/SNS/Route53 (or a single admin role)

XREngine interfaces with several AWS services and requires credentials for these purposes. You could make
one admin role with full access to all AWS services, but we recommend making separate, scoped roles for
each individual service. To create a role, do the following:

### Creating an IAM role
Go to IAM->Users, and click on the Add User button. For User Name, enter <service>-admin, e.g. `S3-admin`.
Check the box for Programmatic Access, the click on the Next:Permissions button.
Click on 'Attach exsiting policies directly'. In the Filter Policies text box, you'll want to
enter the name of the service to narrow down the policy list significantly. Then, look for the FullAccess
policy for that service and select that, and click the Next:Tags button. You don't need to tag it with
anything, just click the Next:Review button, then the Create User button.

The following screen should show Success and have the user listed. Copy the 'Access key ID' somewhere, and
also click the Show toggle under 'Secret access key' and copy that elsewhere as well. You will put these
into the Helm config file later.

### IAM Roles to create
Here are the services you want to create IAM admin users for, and the associated permissions you want to
grant them:

* Route53: `AmazonRoute53FullAccess` 
* S3: `AmazonS3FullAccess`
* SNS: `AmazonSNSFullAccess`

### Creating new credentials for an IAM user
If you ever lose the secret to a user, or want to make new credentials for whatever reason, go to
IAM->Users and click on that user. Click on the 'Security credentials' tab, and under 'Access keys' you
should see a button 'Create access key' and, underneath that, 0-2 existing keys with some information
about them and an 'x' on the far right to delete it. If there are two keys for that user, you 
must deactivate and delete one of them before making a new one.

Click the Create button, then make sure to save the public and secret keys somewhere and put them into
the Helm config file.

## Create RDS box

XREngine is backed by a SQL server. We use MariaDB in development, but it has also been run on AWS with
Aurora without issue. Most other versions of SQL should work but have not been explicitly tested.


### Accessing RDS box from an external machine
By default, an RDS box is only accessible from within the VPC it's located.
If you want to be able to connect to it from outside that VPC, you'll need to either set up a bastion box
and SSH into that box, or make the RDS box publicly accessible.

Setting up a bastion box is not covered here at this time. The steps to make it public will be noted
below by **Make RDS public**

### Create RDS instance
Go to RDS and click the Create Database button. Most options can be left at their default values.
Under Settings, give a more descriptive DB cluster identifier. The Master Username can be left as admin;
enter a Master Password and then enter it again in Confirm Password.

Under DB instance class, pick an option that best meets your pricing needs.

Under Availability and Durability, it's recommended that you leave it on the default of
making an Aurora Replica in another AZ.

Under Connectivity, make sure that it's in the VPC that was made as part of the EKS cluster.

**Make RDS public**
If you want to be able to access it externally, you should set Public Access to 'Yes'.

Under VPC security group, select the ones titled 
`eksctl-<EKS_cluster_name>-cluster-ClusterSharedNodeSecurityGroup-<random_string>` and
`eks-clustersg-<EKS_cluster_name>-<random_string>`.

Open the top-level Additional Configuration dropdown (not the one within Connectivity). Under Database Options-> Initial Database Name,
name the default database and save this for later use in the Helm config file.

Finally, click the Create Database button at the very bottom of the page.

**Make RDS Public** You will need to add a Security Group to the RDS instance that allows traffic over port
3306 (or whatever port you chose to run it on). You can have this SG only let in traffic from your IP address(es)
if you want to be very secure about this, or from anywhere (0.0.0.0/0) if you're less concerned about someone
getting access.

## Edit security group to allow gameserver traffic into VPC
You'll need to edit the new cluster's main security group to allow gameserver traffic.
On the AWS web client, go to EC2 -> Security Groups. There should be three SGs that have
the node's name somewhere in their name; look for the one that is in the form
```eks-cluster-sg-<cluster_name>-<random_numbers>```. It should NOT end with /ControlPlaneSecurityGroup
or /ClusterSharedNodeSecurityGroup.
Click on that, then the Inbound Rules tab, then click Edit Inbound Rules.

You'll need to add two rule sets:
* Type: Custom UDP; Port Range: 7000-8000; Source: Anywhere (or 'Custom 0.0.0.0/0')
* Type: Custom TCP; Port Range: 7000-8000; Source: Anywhere (or 'Custom 0.0.0.0/0')

## Create Route 53 Hosted Zone and set up ACM certificates

Before installing Nginx to the cluster, you'll need to have all of the networking squared away.
This requires creating the necessary SSL certificates and creating some DNS records to point 
various subdomains to the right place.

### Purchase and register domain through Route53 (optional)
If you do not have a domain for your application already, it's easiest to register it through Route53.
Go to Route53->Domains->Registered domains, then click the 'Register Domain' button, and follow the
workflow to register a domain name.

### Create Route 53 Hosted Zone
In the AWS web client, go to Route 53. Make a hosted zone for the domain you plan to use for
your setup of XREngine. You'll be coming back here later to create DNS records.

#### Point external registrar subdomains to use Route53 Nameservers (only if your domain is registered outside Route53)
If you already have a domain registered with another registrar service, you'll need to add some DNS records
in there to point the specific subdomains you'll be using to AWS' nameservers.

First, go to Route53->Hosted Zones and open the domain you'll be using by clicking on the domain name (or
highlighting the row and clicking the 'View details' button). There should be two records under Records.
Look for the one of type 'NS'; under 'Value/Route traffic to', there should be four lines that all start
with 'ns-'. These will be used shortly.

Go to your external registrar and go to the DNS records page. For each subdomain that will be in use, you
need to add four records of type 'NS'. The Name wil be the subdomain, and the Nameserver will be one of
the four lines under the 'NS'. You need a record for each of the four lines.

If you're setting up multiple deployments, e.g. both a dev and prod deployment, you'll need a set of four
NS records for each subdomain that those deployments will be behind.

### Create certificates with ACM

Go to Amazon Certificate Manager. If there are no certs in that region, click on Get Started under Provision Certificates,
otherwise click on Request a Certificate.

You should select Request a Public Certificate, then select Request a Certificate. The next page
should be headed Add Domain Names. You should add both the top-level domain, such as ```xrengine.io```, 
as well as a wildcard for all subdomains e.g. ```*.xrengine.io```, then click Next.

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

## Install Agones, ingress-nginx, and a copy of redis for each deployment

Now that the cluster is up and running, we can install everything onto it.
When you created the cluster with eksctl, it should have created a context pointing to
it in kubectl. Run ```kubectl config get-contexts``` to get all of the contexts it knows about;
the one with a star next to it should be named ```<your_AWS_username>@<cluster_name>```.
If that isn't present, you'll have to edit the configuration to make the appropriate context.

You next need to add the Agones, ingress-nginx, and redis Helm charts to helm by running 
```helm repo add agones https://agones.dev/chart/stable```, ```helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx```, and ```helm repo add redis https://charts.bitnami.com/bitnami```.
You should also at this time add XREngine's repo via ```helm repo add xrengine https://helm.xrengine.io```.

If you ever suspect that a chart is out-of-date, run ```helm repo update``` to update all of them to the latest.

### Install Agones
From the top level of this repo, run ```helm install -f ./packages/ops/configs/agones-default-values.yaml agones agones/agones```.
This says to install a service called 'agones' from the 'agones' package in the 'agones' chart, and to configure it with
a file found at /packages/ops/configs/agones-default-values.yaml.

### Install redis for each deployment

Each deployment of XREngine uses a redis cluster for coordinating the 'feathers-sync' library.
Each redis deployment needs to be named the same as the deployment that will use it; for an
XREngine deployment named 'dev', the corresponding redis deployment would need to be named
'dev-redis'.

Run ```helm install  -f packages/ops/configs/redis-values.yaml <deployment_name>-redis redis/redis``` to install, e.g.
```helm install  -f packages/ops/configs/redis-values.yaml dev-redis redis/redis```.
If you named the redis nodegroup something other than 'ng-redis-1', you'll have to alter the value in
packages/ops/configs/redis-values.yaml in two places to your redis nodegroup name.
If you didn't create a nodegroup just for redis, you must omit the ` -f packages/ops/configs/redis-values.yaml `,
as that config makes redis pods run on a specific nodegroup.

#### Installing redis as part of XREngine chart (not recommended for production)
redis can be installed as part of the XREngine chart so long as the config file for the XREngine installation has 'redis.enabled' set to true.
In that case, you should skip the above step of installing redis separately. This is not recommended for production
environments, though, since upgrades to an XREngine installation will usually reboot the redis servers,
leading all of the gameservers to crash due to their redis connections being severed.

This breaks Agones' normal behavior of keeping Allocated gameservers running until every user has left and slowly replacing
old Ready gameservers with new ones, maintaining an active pool of gameservers at all times. You will encounter a period
of time where there are no active gameservers at all, which is not recommended, and all gameservers in use
will immediately go down.

### Install ingress-nginx
**This step cannot finish until the associated ACM Certificate is fully validated** 
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

## Upgrade Classic LoadBalancer to Application LoadBalancer
**This step cannot be done until the ingress-nginx service installation step has completed, which requires the associated ACM Certificate to be validated**

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

In the AWS web client, go to SES -> Domains. Click Verify a New Domain, then enter the top-level
domain and check the box for Generate DKIM Settings, then click Verify This Domain.
On the modal that pops up, there should be a button to create all the records in Route 53;
click it. Then click Close.

### Create SMTP credentials
You need to create SMTP credentials in order to authorize SES. These will show up as an IAM user,
but you must go through an SES-specific process to get valid credentials; just creating an IAM user
with SESFullAccess will not work.

Go to an SES page and select 'SMTP Settings', then click the button 'Create My SMTP Credentials'.
You can leave the default IAM User Name as-is; click the Create button. You should be taken to a screen
says a user has been created successfully. Click on 'Show User SMTP Security Credentials'.

You will see a Username and Password. The Username is like any other IAM user ID, but the Password
needs to be transformed in order to make it a valid Secret.

These credentials will go into the Helm config file. You must also fill in the region that you've
created these credentials in, replacing <SES_REGION> in api.extraEnv.SMTP_HOST.

### Move SES out of Sandbox
By default, SES domains are in Sandbox mode, where they can only send emails to verified email addresses.
To request that the domain be moved out of Sandbox mode, go to SES->Email Sending->Sending Statistics.
Click on the button 'Edit your account details' to open the modal. Set 'Enable Production Access' to Yes,
leave Mail type on 'Transactional', then fill in the Website URL, add a Use case description (basically
just assure them that this is for account login only, not anything else), click the checkbox to agree
to their TOD, and click the button 'Submit for review'.

It may take up to a few days for them to take action. If the request is rejected, address their concerns.
Once you have been approved, email login should work for any email address.

#### Verifying test emails
Before you have production use for your SES domain, in order to log in you'll have to verify specific email
addresses with SES. Go to SES->Identity Management->Email Adresses. Click on the button 'Verify a New Email
Address'. Enter the address you want to test with, then click 'Verify This Email Address'. You should soon
receive an email with a link to verify it (it may go to your Spam folder). Once you've followed the link,
you can log in with that address.

## Set up Simple Notification service
SNS is used to send text messages from the XREngine platform.

In the AWS web client, go to SNS -> Topics and Create a new topic.
Give it a name, and selected 'Standard' as the type, then click Create Topic.

## Set up S3 bucket for static resources and Cloudfront distribution

Various static files are stored in S3 behind a Cloudfront distribution.

### Create S3 bucket
In the AWS web client, go to S3 -> Buckets and click Create Bucket.
Name the bucket <name>-static-resources, e.g. ```xrengine-static-resources```, and have it be in Region us-east-1.
Uncheck the checkbox Block *all* Public Access; you need the bucket to be publicly accessible.
Check the box that pops up confirming that you know the contents are public.
All other settings can be left to their default values; click Create Bucket.

Open the bucket's settings and go the Permissions tab. Midway down is 'Access control list'. Edit that, and
Check the boxes for Objects:List and Bucket ACL:Read for 'Everyone (public access)'. Click the box with the
warning label that appears that says "I understand the effects of these changes on my objects and buckets",
then click Save Changes.
At the bottom of the Permissions tab is a Cross-origin Resource Sharing (CORS) box. 
It should have the following settings; if not, click Edit and copy this in:
```
[
    {
        "AllowedHeaders": [],
        "AllowedMethods": [
            "HEAD",
            "GET",
            "POST"
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
For Alternate Domain Names, enter 'resources.<domain>', e.g. ```resources.xrengine.io```.
For SSL Certificate, select Custom SSL Certificate, then when you click on the box, choose
the 'resources.<domain>' certificate you made earlier.

Everything else can be left at the default values, click Create Distribution.

## Set up DNS records
**The Nginx Load Balancer must be fully set up and running before this step can be completed**

In the AWS web client, go to Route 53, then go into the Hosted Zone you made earlier.
Click on Create Record. If it starts you under Quick Create Record, click the link
'Switch to Wizard'; it's not necessary, but the wizard is handy.

Under Routing Policy, leave it on Simple Routing and click Next. Then click Define Simple Record.

The first record should be for the top-level domain, e.g. ```xrengine.io```, so leave the Record Name
text field blank. Under Value/Route Traffic To, click on the dropdown and select
Alias to Application and Classic Load Balancer. Select the region that your cluster is in.
Where it says Choose Load Balancer, click the dropdown, and select the Application loadbalancer.
Leave the Record Type as 'A - Route traffic to an IPv4 address and some AWS resources', then click
Define Simple Record.

You can keep clicking Define Simple Record to make more records in one batch. When you're
done, click Create Records.

You should make the following 'A' records to the loadbalancer, substituting your domain for 'xrengine.io':

* xrengine.io
* *.xrengine.io
* @.xrengine.io
* api-dev.xrengine.io
* api.xrengine.io
* dev.xrengine.io
* gameserver.xrengine.io
* gameserver-dev.xrengine.io

You also need to make an 'A' record pointing 'resources.xrengine.io' to the CloudFront distribution you made earlier.

## Deploy to EKS using Helm

With all of the networking set up, you can finally deploy the codebase to EKS.
You should have a .yaml file with various configuration variables specified for your deployment.
The Helm chart will pull a Docker image from the lagunalabs/xrengine Docker Hub account.
There's a CI/CD pipeline attached to the XREngine GitHub account that builds every
time the dev and master branches are updated, and tags each build with the GitHub SHA
of the latest commit. You'll have to provide this SHA as part of the configuration, most
easily as one-off settings as demonstrated below.

### Fill in Helm config file with variables
Template Helm config files for dev and prod deployments can be found at packages/ops/configs/<dev/prod>.template.values.yaml.
Before filling them in, make a copy elsewhere, call that '<dev/prod>.values.yaml', and edit that copy.

There are many fields to fill in, most marked with <>. Not all are necessary for all situations - if you're not
using social login, for instance, you don't need credentials for Github/Google/Facebook/etc. `

### Run Helm install
Run ```helm install -f </path/to/*.values.yaml> --set api.image.tag=<latest_github_commit_SHA>,client.image.tag=<latest_github_commit_SHA>,gameserver.image.tag=<latest_github_commit_SHA> --set-string api.extraEnv.FORCE_DB_REFRESH=true <stage_name> xrengine/xrengine```

After a minute or so, all of the pods should be up and running, and you should be able to
go to the root domain you have this deployment running on and see something.

#### Unset FORCE_DB_REFRESH
Setting the environment variable api.extraEnv.FORCE_DB_REFRESH to 'true' tells the API servers to wipe
and (re-)seed the database. This is required during initial setup, but you don't want every new api server
pod that's spun up to re-run this. A few minutes after running the `helm install` command, you should
run ```helm upgrade --reuse-values --set-string api.extraEnv.FORCE_DB_REFRESH=false <stage_name> xrengine/xrengine```.
This will set the ENV_VAR to 'false', and the API servers will not attempt to seed anything.

### Upgrading an existing Helm deployment
One of the features of Helm is being able to easily upgrade deployments with new values. The command to
do this is very similar to the install command:

```helm upgrade --reuse-values -f </path/to/*.values.yaml> --set api.image.tag=<latest_github_commit_SHA>,client.image.tag=<latest_github_commit_SHA>,gameserver.image.tag=<latest_github_commit_SHA> <stage_name> xrengine/xrengine```

```--reuse-values``` says to carry over all configuration values from the previous deployment.
Using ```-f <config_file>``` and ```--set <variables>``` after it will apply any changes on top of the
carryover values.

If you're not deploying a new version of the codebase, you can skip the entirety of the ```--set *.image.tag=<SHA>```.
