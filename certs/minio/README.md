# MinIO Certificates

This certificate is generated using [certgen](https://github.com/minio/certgen) utility from MinIO.

It was generated using following command:

```bash
certgen -host "127.0.0.1,localhost"
```

MinIO expects them with the private key as `private.key` and public certificate as `public.crt`.

Read more on following links:

- https://min.io/docs/minio/linux/operations/network-encryption.html
- https://hub.docker.com/r/bitnami/minio/
