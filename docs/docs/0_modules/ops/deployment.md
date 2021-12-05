---
id: deployment
title: Deployment
---

## Deployment

[AWS EKS Deployment](https://github.com/xrengine/xrengine/blob/dev/packages/ops/docs/EKS-setup.md)

[Managing Kubernets](https://github.com/xrengine/xrengine/blob/dev/packages/ops/docs/managing_remote_kubernets.md)

[Managing Helm Charts](https://github.com/xrengine/xrengine/blob/dev/packages/ops/docs/release-helm-chart.md)

[Cloudformation Scripts](https://github.com/xrengine/xrengine/blob/dev/packages/ops/xrengine-cloudformation)

## Testing

Simply run `npm run test` and all your tests in the `test/` directory will be run.

## Linting

`npm run lint`

## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xrengine .

# Run the image (deletes itself when you close it)
docker run -d --rm --name server -e "MYSQL_URL=mysql://server:password@db:3306/xrengine" -p "3030:3030"  xrengine

# Stop the server
docker stop server
```
