---
id: docker
title: Docker
---

### Docker image configurations

Enviroment variables:
- `NODE_ENV` controls the config/*.js file for feathers.js to load [default: production]
- `PORT` controls the listening port [default: 3030]
- `MYSQL_URL` e.g. `mysql://<user>:<pass>@<host>:<port>/<db>` points to MariaDB server with a username and password