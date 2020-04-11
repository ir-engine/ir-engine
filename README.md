# xrchat-ops
Deployment and Operations for xrchat services

## Run services on your development machine

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
- run `docker-compose up` then wait a couple of mins to build
- all services will be running as detailed in [service](Services) section.

## Services

- xrchat-server: backend server on http://localhost:3030
- xrchat-client: frontend Next.js+react on http://localhost:3000
- xrchat-realtime-server: still under development TBD
- DB: MariaDB on default port [mysql://localhost:3306]()
- Adminer: a lightweight web app to manage database, http://localhost:8080/?server=db&username=server&db=xrchat 
Note: password is "password"
