# xrchat-ops
Deployment and Operations for xrchat services

## One-Click Deployment

You can run the whole platfrom with the following commands:
``` bash
git clone git@github.com:xrchat/xrchat-ops.git
cd xrchat-ops
docker-compose up
```
To run specific services
```
docker-compose up <service-name>
```

This will pull images from [xrchat's docker hub repo](https://hub.docker.com/u/xrchat)

## xrchat services

- [server](https://github.com/xrchat/xrchat-server): backend server on http://localhost:3030/docs
- [client](https://github.com/xrchat/xrchat-client): frontend Next.js+react on http://localhost:3000
- [rts](https://github.com/xrchat/xrchat-realtime-server): Networked AFrame server on http://localhost:8081
- adminer: a lightweight web app to manage database, http://localhost:8080/?server=db&username=server&db=xrchat  (Note: password is "password")
- db: MariaDB on default port [mysql://localhost:3306]() 

## Build docker/compose stack yourself

If you want to build the whole compose stack on your machine, and not pull the containers from docker-hub

- install [docker](https://docs.docker.com/get-docker/).
- clone the 3 repos into the same folder with the same names:
    ```
    |
    +-- xrchat-client
    +-- xrchat-server
    +-- xrchat-ops
    +-- xrchat-realtime-server
    ```
- `cd xrchat-ops`
- run `docker-compose -f docker-compose-local.yml build`
- run `docker-compose -f docker-compose-local.yml up`
- all services will be running as detailed in [service](Services) section.

