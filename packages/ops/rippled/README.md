# Rippled

Rippled charts for [XREngine](https://xrfoundation.io/).

## Installing the Chart

Please first create `rippled.cfg` and `validator.txt` files in `./config` folder of charts. For staters create a copy of template files with these names in the same folder.

To install the chart with the release name `my-release`:

``` bash
cd RIPPLED_CHARTS_FOLDER
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
