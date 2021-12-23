# xrengine-matchmaking

##Start minikube:
First, you'll need to start minikube with the `ingress` addon. This will allow the Open Match Helm chart to install
an ingress that will route incoming traffic to Open Match's frontend service over a configured hostname.
```bash
minikube start --addons ingress
```

If minikube has already been created, you can enable the ingress by running `minikube addons enable ingress`

## Install Helm
Follow the [instructions](https://helm.sh/docs/intro/install/) for installing Helm on your OS.

## Install Open Match with local open-match Helm chart
A Helm chart containing all of the Open Match resources needed for XREngine matchmaking is located
in `packages/ops/open-match`. You can install it by running
`helm install --set frontend.host=<hostname> open-match packages/ops/open-match`

`<hostname>` is a hostname that the frontend service will be reachable at, e.g. `local-matchmaking.xrengine.io`.
You can set it to be whatever you want. After you do, you'll need to edit your computer's hostfile to point this
hostname to the IP address of minikube.

### Point hostname in hostfile to minikube's IP
Run `minikube ip`. This will give you minikube's IP address.
Next, edit the file `/etc/hosts` (or whatever your hostfile is called if not on Linux); you may need to execute `sudo`
privileges to edit it. You'll need to add a line like this:

`<minikube ip>  <hostname>`, e.g. 

`192.168.99.101   local-matchmaking.xrengine.io`

Make sure to save the file after you've added this line. This will tell your machine to route traffic to that hostname
to minikube. When combined with the Ingress that the Open Match Helm chart installs, this will then route the traffic
to the frontend service. Be aware that the Ingress is only routing traffic coming in on the path /v1/frontendservice.

* note: sometimes on localhost redis synchronisation is not working correctly,
it's usually leads to "Ticket not found" on getting ticket assignment even if ticket was just created. 
if this happens then run `kubectl scale -n open-match statefulset open-match-redis-node --replicas=1` to limit redis pod to one.  

## Build director and matchfunction Docker images
Navigate to packages/matchmaking and build the director and matchfunction images.
```bash
cd packages/matchmaking/

#this line for localhost development
eval $(minikube docker-env)

./build-all-pods.sh
```

This will build the images with the registry `lagunalabs` by default. If you wish to build them to a different registry,
set the `REGISTRY` environment variable, e.g. `REGISTRY=example-reg ./build-all-pods.sh`

If you want to automatically push the images to the registry they've been built towards, add `push` as a parameter:
`REGISTRY=example-reg ./build-all-pods.sh push` Otherwise, you'll have to manually push the images to the right repo.

## Install matchmaking via Helm chart
You'll next install the matchmaking deployment using the Helm chart in packages/ops/xrengine-matchmaking. Make sure that 
the path at the end of the following command is relative to the directory you're still in; it was written assuming
you're in packages/matchmaking after just building the images, and will be different if you're in the repo root or
some other directory.

The file referenced below as path/to-matchmaking.yaml is a simple configuration file. There is a template for it in
`packages/ops/configs/local.matchmaking.template.values.yaml`. <release> is a release name, e.g. `local` for local
development; make sure to replace it when naming it in the `helm install` command and in the values.yaml file.
```
helm install -f path/to/matchmaking.yaml <release>-matchmaking ../ops/xrengine-matchmaker
```

After 30 seconds or so, the matchmaker services should be running.

when update needed from pods, navigate to `packages/matchmaking`
and run `./build-pod.sh director` or  `./build-pod.sh matchfunction` to build corresponding pod



# misc

===============================================================

Detailed instructions on open match: [Install Core Open Match](https://open-match.dev/site/docs/installation/yaml/#install-core-open-match)

###hardcoded
game modes hardcoded:
`open-match-custom-pods/director/profile.go:24`

team size is probably here:
`open-match-custom-pods/matchfunction/mmf/matchfunction.go` in `ticketsPerPoolPerMatch`

###cleanup
delete custom pods
```bash
helm uninstall local-matchmaking
```

delete open-match
```bash
helm uninstall open-match
```