# MinIO Certificates

This certificate is generated using [certgen](https://github.com/minio/certgen) utility from MinIO.

It was generated using following command:

```bash
certgen -host "127.0.0.1,localhost"
```

The certificates are inside `minio/certs` folder because MinIO expects them in `/certs` directory, with the private key as `private.key` and public certificate as `public.crt`.

Read more on following link:

https://min.io/docs/minio/linux/operations/network-encryption.html
