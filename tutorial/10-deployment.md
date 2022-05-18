[AWS EKS Deployment](../packages/ops/docs/AWS-setup.md)

[Managing Kubernetes](../packages/ops/docs/managing_remote_kubernets.md)

[Managing Helm Charts](../packages/ops/docs/release-helm-chart.md)

[Cloudformation Scripts](../packages/ops/xrengine-cloudformation)

[Cloudformation Scripts](../packages/ops/xrengine-cloudformation)

### Docker image configurations

Enviroment variables:
- `APP_ENV` controls the config/*.js file for feathers.js to load [default: production]
- `PORT` controls the listening port [default: 3030]
- `MYSQL_URL` e.g. `mysql://<user>:<pass>@<host>:<port>/<db>` points to MariaDB server with a username and password

### Run in Kubernetes locally

First, you'll need minikube installed and running, as well as kubectl. Next, you'll want to point your shell to minikube's docker-env
so that you don't need to push the Docker image to an external repository. Run the following:

```eval $(minikube docker-env)```

For now, this process will use a separate Dockerfile called 'Dockerfile-dev'. You'll have to build the image using
it by running the following command:

```docker build -t xrengine/xrengine:v0.0.0 -f Dockerfile-dev .```

Once that image is built, make sure that kubectl is pointed to minikube.
Run ```kubectl config get-contexts``` and there should be a '*' next to minikube; alternatively, run 
```kubectl config current-context```, and it should show minikube.
If it's not, run ```kubectl config set-context minikube``` to change to it.

You'll need to deploy two Kustomize scripts to Minikube.
The first one is the nginx-ingress setup.
Run ```kubectl apply -k kubernetes/nginx/base```.

You'll need to have a file called 'xrengine-dev-secrets.env' in kubernetes/xrengine/base.
This is in the gitignore to demonstrate that these sorts of files should never be committed.
The production one is expected to be called 'xrengine-secrets.env' and is also in the gitignore.
As these are very sensitive files, they should be transmitted to you securely.

Finally run ```kubectl apply -k kubernetes/xrengine/base``` to deploy the MariaDB server and xrengine.
The server is set up in dev mode to be behind the domain 'api.dev.xrengine.dev' and is secured by a self-signed certificate.
If you wanted to call one of the endpoints with curl, you could run the following and get a 401 error: 
```curl https://192.168.99.109/user -H HOST:api.dev.xrengine.dev --insecure```

NOTE: As of this writing, the MariaDB server sometimes finishes initializing after xrengine has already tried to
connect to it. To reboot xrengine, run the following:

```kubectl rollout restart -n xrengine deployments/xrengine```
