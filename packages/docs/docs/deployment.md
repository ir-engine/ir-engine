---
id: deployment
title: Deployment
---


## Deployment

[AWS EKS Deployment](https://github.com/xr3ngine/xr3ngine/blob/dev/packages/ops/docs/EKS-setup.md)

[Managing Kubernets](https://github.com/xr3ngine/xr3ngine/blob/dev/packages/ops/docs/managing_remote_kubernets.md)

[Managing Helm Charts](https://github.com/xr3ngine/xr3ngine/blob/dev/packages/ops/docs/release-helm-chart.md)

[Cloudformation Scripts](https://github.com/xr3ngine/xr3ngine/blob/dev/packages/ops/xr3-cloudformation)

## Testing

Simply run `yarn test` and all your tests in the `test/` directory will be run.

## Linting

`yarn run lint`

## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xr3ngine .

# Run the image (deletes itself when you close it)
docker run -d --rm --name server -e "MYSQL_URL=mysql://server:password@db:3306/xr3ngine" -p "3030:3030"  xr3ngine

# Stop the server
docker stop server
```
