# XREngine

[XREngine](https://myxr.social/) Social Gatherings on the Web.

## TL;DR

```console
helm repo add xrengine https://helm.xrengine.io
helm install my-release xrengine/xrengine
```

## Introduction

This chart bootstraps a [XRCyat](https://myxr.social/) deployment on a [Kubernetes](http://kubernetes.io) cluster using the [Helm](https://helm.sh) package manager.

[***In Progress***] This chart has been tested to work with NGINX Ingress, cert-manager, fluentd and Prometheus on top of the AWS EKS.

It also optionally packages following which are required for xrengine platform:

| Repository | Name | Version |
|------------|------|---------|
| https://charts.bitnami.com/bitnami | mariadb | 7.3.16 |
| https://agones.dev/chart/stable | agones [***in progress***] | 1.4.0 |

## Prerequisites

- Kubernetes 1.14+
- Helm v2.11+ or Helm 3.1+ to run "weighted" hooks in right order.
- Persistent Volumes provisioner support in the underlying infrastructure.

## Installing the Chart

To install the chart with the release name `my-release`:

``` bash
helm repo add xrengine https://helm.xrengine.io
helm repo update
helm install my-release xrengine/xrengine            # Helm 3
helm install --name my-release xrengine/xrengine     # Helm 2
```

XREngine
The command deploys XREngine on the Kubernetes cluster in the default configuration. The [configuration](#configuration) section lists the parameters that can be configured during installation.

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall/delete the `my-release` deployment:

```console
helm delete my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.

## Configuration

The following table lists the configurable parameters of the XREngine chart and their default values.

Dependent charts can also have values overwritten. Preface values with mariadb.*or agones.*

| Key | Type | Default | Description                |
|-----|------|---------|----------------------------|
| agones.enabled | bool | `false` | Install Agones included with chart, set `false` if you have it installed already on your cluster |
| client.affinity | object | `{}` | Node affinity for the client service |
| client.enabled | bool | `true` | Install xrsocial-client service |
| **client.extraEnv** | object | `{}` | [Additional Configuration](#xrengine-additional-configurations) for the client service |
| client.image.pullPolicy | string | `"Always"` | Image pull policy |
| client.image.repository | string | `"xrsocial/client"` | repo to pull client image from |
| client.image.tag | string | `"latest"` | client version to pull |
| client.imagePullSecrets | list | `[]` | if using a private repo, specify a pull secret |
| client.ingress.annotations | object | `{"kubernetes.io/ingress.class": "nginx"}` | if using a different ingress controller, specify it |
| client.ingress.enabled | bool | `true` | disable ingress definitions |
| **client.ingress.hosts[0].host** | string | `"my.xrengine.com"` | hostname for the client |
| client.ingress.hosts[0].paths[0] | string | `"/"` | default path for client |
| client.name | string | `"xrsocial-client"` | client service name |
| client.nameOverride | string | `""` | changes the client service name |
| client.nodeSelector | object | `{}` | selects a specific node to run on |
| client.securityContext | object | `{}` | overrides client security context |
| client.service.port | int | `3000` | default client port |
| client.service.type | string | `"ClusterIP"` | override client service type |
| client.serviceAccount | object | `{}` | override client service account |
| client.tolerations | list | `[]` |  |
| domain | string | `"xrengine.dev"` | domain root for all services, services will be subdomain from it |
| mariadb.db.existingSecret | string | `nil` | Use existing secret for password details (rootUser.password, db.password, replication.password will be ignored and picked up from this secret). The secret has to contain the keys mariadb-root-password, mariadb-replication-password and mariadb-password. |
| mariadb.db.name | string | `"xrengine"` | Database name to connect to |
| mariadb.db.password | string | Password for the new user. Ignored if existing secret is provided. | random 10 character alphanumeric string if mariadb.db.user is defined |
| mariadb.db.user | string | `"xrengine"` | Username created/used to connect to database |
| mariadb.enabled | bool | `true` | Install internal mariadb, 'false' to use external db |
| mariadb.externalHost | string | `nil` | hostname of external MariaDB instance, ignored if `mariadb.enabled` is `true` |
| mariadb.replication.enabled | bool | `false` | Enable MariaDB slave replication |
| server.affinity | object | `{}` |  |
| server.enabled | bool | `true` | Install the xrsocial service |
| **server.extraEnv** | object | `{}` | [Additional Configuration](#xrengine-additional-configurations) for xrsocial service |
| server.fullnameOverride | string | `""` | override server fullname template |
| server.image.pullPolicy | string | `"Always"` | Server pull policy |
| server.image.repository | string | `"xrengine/xrsocial"` | server image repo |
| server.image.tag | string | `"latest"` | server image version |
| server.imagePullSecrets | list | `[]` | server image pull secret |
| server.ingress.annotations | object | `{"kubernetes.io/ingress.class": "nginx"}` | server ingress class |
| server.ingress.enabled | bool | `true` | enable ingress traffic to server |
| **server.ingress.hosts[0].host** | string | `"api.xrsocial.com"` | hastname for server service, used by client for API and backend operations |
| server.ingress.hosts[0].paths[0] | string | `"/"` | default path for server over http |
| server.name | string | `"xrsocial"` | server service name |
| server.nameOverride | string | `""` | overrides name template |
| server.nodeSelector | object | `{}` | specify a node selector |
| server.podSecurityContext | object | `{}` | server pod security |
| server.replicaCount | int | `1` | How many server instances to run |
| server.resources | object | `{}` | CPU/Memory resource requests/limits |
| server.securityContext | object | `{}` | overrides server security context |
| server.service.port | int | `3030` | service http port |
| server.service.type | string | `"ClusterIP"` | Kubernetes service type |

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example,

```console
$ helm install --name my-release \
  --set persistence.enabled=false,email.host=email \
    xrengine/xrengine
```

Alternatively, a YAML file that specifies the values for the above parameters can be provided while installing the chart. For example,

```console
helm install --name my-release -f values.yaml xrengine/xrengine
```

> **Tip**: You can use the default <values.yaml>

## XREngine Additional Configurations

This section lists configuration specific for server, client components.

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| client.extraEnv.API_SERVER | string | `"http://xrengine.local"` |  |
| client.extraEnv.APP_ENV | string | `"development"` |  |
| client.extraEnv.SITE_DESC | string | `"Connected Worlds for Everyone"` |  |
| client.extraEnv.SITE_TITLE | string | `"MyXR"` |  |
| rts.extraEnv.NAF_LISTEN_PORT | string | `"8081"` |  |
| server.extraEnv.APP_HOST | string | `"http://api.xrengine.local/"` |  |
| server.extraEnv.FACEBOOK_CALLBACK_URL | string | `"http://127.0.0.1:3000/oauth/facebook"` |  |
| server.extraEnv.FACEBOOK_CLIENT_ID | string | `nil` |  |
| server.extraEnv.FACEBOOK_CLIENT_SECRET | string | `nil` |  |
| server.extraEnv.GITHUB_CALLBACK_URL | string | `"http://127.0.0.1:3000/oauth/github"` |  |
| server.extraEnv.GITHUB_CLIENT_ID | string | `nil` |  |
| server.extraEnv.GITHUB_CLIENT_SECRET | string | `nil` |  |
| server.extraEnv.GOOGLE_CALLBACK_URL | string | `"http://127.0.0.1:3000/oauth/google"` |  |
| server.extraEnv.GOOGLE_CLIENT_ID | string | `nil` |  |
| server.extraEnv.GOOGLE_CLIENT_SECRET | string | `nil` |  |
| server.extraEnv.MAIL_FROM | string | `"noreply@xrengine.local"` |  |
| server.extraEnv.MYSQL_DATABASE | string | `"xrengine"` |  |
| server.extraEnv.MYSQL_PASSWORD | string | `"password"` |  |
| server.extraEnv.MYSQL_PORT | int | `3306` |  |
| server.extraEnv.MYSQL_USER | string | `"server"` |  |
| server.extraEnv.PORT | string | `"3030"` |  |
| server.extraEnv.SMTP_HOST | string | `nil` |  |
| server.extraEnv.SMTP_PASS | string | `nil` |  |
| server.extraEnv.SMTP_PORT | string | `nil` |  |
| server.extraEnv.SMTP_USER | string | `nil` |  |
| server.extraEnv.STORAGE_AWS_ACCESS_KEY_ID | string | `"<AWS ACCESS KEYS>"` |  |
| server.extraEnv.STORAGE_AWS_ACCESS_KEY_SECRET | string | `"<AWS SECRET>"` |  |
| server.extraEnv.STORAGE_PROVIDER | string | `"local"` |  |
| server.extraEnv.STORAGE_S3_BUCKET_NAME | string | `"xrengine-storage"` |  |
| server.extraEnv.STORAGE_S3_CLOUDFRONT_DOMAIN | string | `"https://<MyCdnDistribution>.s3.amazonaws.com"` |  |
| server.extraEnv.STORAGE_S3_PUBLIC_VIDEO_BUCKET | string | `"xrengine-video"` |  |
| server.extraEnv.STORAGE_S3_PUBLIC_VIDEO_PATH | string | `"/"` |  |
| server.extraEnv.STORAGE_S3_REGION | string | `"<S3 Region>"` |  |


## MariaDB

By default, MariaDB is installed as part of the chart. To use an external MariaDB server set `mariadb.enabled` to `false` and then set `mariadb.externalHost` and `mariadb.db.password`.

To avoid issues when upgrading this chart, provide `mariadb.rootUser.password` for subsequent upgrades. Otherwise the password will be overwritten with randomly generated every upgrade. See https://github.com/bitnami/charts/tree/master/bitnami/mariadb/#upgrading for more detail.

## Agones

[**TBD**] By default, Agones is installed as part of the chart. To use an external Agones operator set `agones.enabled` to `false`.

## Persistence

The [MariaDB]() image stores the database in a persistent volume.

Persistent Volume Claims are used to keep the data across deployments. This is known to work in GCE, AWS, and minikube. See the [Configuration](#configuration) section to configure the PVC or to disable persistence.

## Ingress

This chart provides support for Ingress resource. If you have an available Ingress Controller such as Nginx or Traefik you maybe want to set `ingress.enabled` to true and choose an `server.ingress.hosts[0].host` and `client.ingress.hosts[0].host` for the URL. Then, you should be able to access the installation using that address.

## Metrics and Performance monitoring

[*TBD*]

## Error reporting and Alerts

[*TBD*]

## Upgrading

[*TBD* - This section will describe any information needed when upgrading the Platform or the chart itself]