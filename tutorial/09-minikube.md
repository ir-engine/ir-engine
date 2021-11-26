# Deploying XREngine on minikube

## Install kubectl, Helm, Docker, and VirtualBox
If [kubectl](https://kubernetes.io/docs/tasks/tools/), [Helm](https://helm.sh/docs/intro/install/),
[Docker](https://docs.docker.com/get-docker/) and/or [VirtualBox](https://www.virtualbox.org/wiki/Downloads)
aren't already installed on your machine, install them.

You may also need to install [Docker Compose](https://docs.docker.com/compose/install/)

## Download and install minikube
Instructions can be found [here](https://minikube.sigs.k8s.io/docs/start/)

While you can follow the demo instructions there about starting minikube, deploying
some demo deployments, etc. to get a feel for it, before deploying XREngine you should delete
your minikube cluster, since we have some specific starting requirements.

## Start MariaDB server locally via Docker
For simplicity, we recommend running a MariaDB server on your local machine outside of minikube.
Later instructions will set up minikube so that it can access this server

If you run `docker-compose up` from the top-level `/scripts` directory in XREngine, it will
start up a MariaDB docker image (as well as a redis server, which is not needed). Once the
MariaDB Docker image is stopped, you can start it again by running `docker start xrengine_db`. 

Alternatively, if you want to just run MariaDB on its own without Docker, that's fine too.
You'll just have to configure the Helm config file to have the appropriate SQL server configuration.

## Create minikube cluster
Run the following command:
`minikube start --disk-size 40000m --cpus 4 --memory 10124m --addons ingress --driver virtualbox`

This says to start minikube with 40GB of disk space, 4 CPUs, 10GB of memory, using VirtualBox as its
driver, and starting up an nginx ingress service.

The disk space, CPUs, and memory allocation are configurable. These are what we recommend for optimal
running (though the disk space might be a bit more than necessary). When minikube is running,
it will reserve those resources for itself regardless of whether the services in minikube are using
that much.

The 10GB of memory might be the spec with the least wiggle room. Later instructions on building
the Docker image will have it be built in the minikube context. This uses the RAM reserved for minikube,
and the client build process normally uses about 8GB of RAM at its peak. minikube may freeze if
it gets maxed out on RAM, and the Docker build process might freeze indefinitely.

### Starting ingress after minikube has started
If you forget to use `--addons ingress` when starting minikube, you can start nginx later by
running `minikube addons enable ingress`

## Get minikube IP address and edit system hostfile to point to 
Run this command after minikube has started: `minikube ip`
This will get you the address that minikube is running on.

You'll need to edit your hostfile to point certain domains to minikube IP addresses. On Linux,
this is done by running `sudo gedit /etc/hosts`.

Add the following lines:
`<Output of 'minikube ip'>  local.theoverlay.io api-local.theoverlay.io gameserver-local.theoverlay.io 00000.gameserver-local.theoverlay.io 00001.gameserver-local.theoverlay.io 00002.gameserver-local.theoverlay.io 00003.gameserver-local.theoverlay.io`
`10.0.2.2   host.minikube.local`

The first line says to point several *-local.theoverlay.io domains internally to the minikube cluster,
where the nginx ingress server will redirect the traffic to the appropriate pod.
The second line is used to give minikube access to your local environment, particularly so that it
can access the MariaDB server.

Make sure to save this file after you've edited it. On Linux, at least, you need root permissions
to edit it.

## Add Helm repos
You'll need to add a few Helm repos. Run the following:
`helm repo add https://agones.dev/chart/stable agones`
`helm repo add https://charts.bitnami.com/bitnami redis`
`helm repo add https://helm.xrengine.io xrengine`

This will add the Helm charts for Agones, redis, and XREngine, respectively.

## Install Agones and redis deployments
After adding those Helm repos, you'll start installing deployments using Helm repos.

Make sure that kubectl is pointed at minikube by running `kubectl config current-context`,
which should say 'minikube'. You can also run `kubectl config get-contexts` to get all contexts
that kubectl has been configured to run; the current one will have a '*' under the left-most
'current' column.

Once kubectl is pointed to minikube, from the top of the XREngine repo, run
`helm install -f packages/ops/configs/agones-default-values.yaml agones agones/agones` to install Agones
and `helm install local-redis redis/redis` to install redis.

You can run `kubectl get pods -A` to list all of the pods running in minikube. After a minute or so,
all of these pods should be in the Running state.

## Point Docker to minikube environment and build Docker file
When minikube is running, run the following command
`eval $(minikube docker-env)`

This points Docker *in the current terminal* to minikube's Docker environment. Anything that Docker builds
will be locally accessible to minikube; if you didn't run that command, Docker would build to your machine's
Docker environment, and minikube would not have access to it.

If you close that tab, or switch to another one, you have to run this command again. If you try to
install XREngine and kubernetes complains about not being able to find the `xrengine` image, make
sure you've build the Docker image to minikube's Docker environment.

Next, from the root of the XREngine repo, run this: `DOCKER_BUILDKIT=1 docker build -t xrengine .`
This will build an image of the entire XREngine repo into a single Docker file. When deployed for
different services, it will only run the parts needed for that service. This may take up to 15 minutes,
though later builds should take less time as things are cached.

## Deploy XREngine Helm chart
Run the following command: `helm install -f </path/to/local.values.yaml> local xrengine/xrengine`.
This will use a Helm config file titled 'local.values.yaml' to configure the deployment.
After a minute or so, running `kubectl get pods` should show one or more gameservers, one or more api
servers, and one client server in the Running state.

## Accept invalid certs
Since there are no valid certificates for this domain, you'll have to tell your browser to ignore the
insecure connections when you try to load the application.

Go to https://local.theoverlay.io/login You should see a warning about an invalid certificate; accept this
invalid cert to get to the login page. You'll next have to open the dev tools for your browser and go to
the console and/or Network tab. There should be errors on https://api-local.theoverlay.io; open that link
in a new tab and accept the invalid certificate for that, too.

When you go to https://local.theoverlay.io/location/test, you'll have to open the console again, find the
erroring https://gameserver-local.theoverlay.io, open that link in a new tab, and accept the invalid certificate
for that domain, as well.
