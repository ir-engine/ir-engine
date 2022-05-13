# IPFS

IPFS charts for [XREngine](https://xrfoundation.io/).

## Installing the Chart

Please first update `values.yaml` of charts.

To install the chart with the release name `my-release`:

``` bash
cd IPFS_CHARTS_FOLDER
helm install my-release .            # Helm 3
helm install --name my-release .     # Helm 2
```

> **Tip**: List all releases using `helm list`

## Uninstalling the Chart

To uninstall the `my-release` deployment:

```console
helm uninstall my-release
```

The command removes all the Kubernetes components associated with the chart and deletes the release.
