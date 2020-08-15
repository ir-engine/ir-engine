[![Build Status](https://travis-ci.org/xr3ngine/xr3ngine.svg?branch=master)](https://travis-ci.org/xr3ngine/xr3ngine)
# XR3ngine

> XR3ngine, built on Node + Feathers + Express + SQL

## About

xr3ngine is an end-to-end solution for hosting humans and AI in a virtual space. This project would literally not be possible without the community contributions of Mozilla Hubs, Janus VR, Avaer + Exokit, Mr Doob, Hayden James Lee and many others.

Our goal is an easy-to-use, well documented, end-to-end Javascript (or Typescript) experience that anyone with a little bit of Javascript and HTML knowledge can dig into, deploy and make meaningful modifications and contributions to. If you fit this category and you are struggling with any aspect of getting started, we want to hear from you.

xr3ngine is a free, open source, MIT-licensed project. You are welcome to do anything you want with it. We hope that you use it to make something beautiful.

## Getting Started

Getting up and running is as easy as 1, 2, 3.

0. Make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed (and if you are using it, [docker](https://docs.docker.com/)).
1. Install your dependencies

    ```
    cd path/to/xr3ngine
    yarn install
    ```
2. Make sure you have a mysql database installed and running -- our recommendation is Mariadb. We've provided a docker container for easy setup:
```
cd scripts && ./start-db.sh
```

This creates a docker image of mariadb named xr3ngine_db.

3. Start your app

```
yarn run dev-reinit-db
```

Load **https://localhost:3030**

### Notes

./start-db.sh only needs to be run once. If the docker image has stopped, start it again with:

    docker container start xr3ngine_db
    

You may refresh the database with:

```
yarn run dev-reinit-db
```

### troubleshooting

#### AccessDenied connecting to mariadb

Make sure you don't have another instance of mariadb running on port 3306

    lsof -i :3306

#### Error: listen EADDRINUSE :::3030

check which process is using port 3030 and kill

    lsof -i :3030
	
	kill -3 proccessIDfromPreviousCommand

## Weird issues with your database?
Try
```
yarn run dev-reinit-db
```

## Testing

Simply run `yarn test` and all your tests in the `test/` directory will be run.

## Linting

`npm run lint`

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```

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

### Docker image configurations

Enviroment variables:
- `NODE_ENV` controls the config/*.js file for feathers.js to load [default: production]
- `PORT` controls the listening port [default: 3030]
- `MYSQL_URL` e.g. `mysql://<user>:<pass>@<host>:<port>/<db>` points to MariaDB server with a username and password

## Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).


### Run in Kubernetes locally

First, you'll need minikube installed and running, as well as kubectl. Next, you'll want to point your shell to minikube's docker-env
so that you don't need to push the Docker image to an external repository. Run the following:

```eval $(minikube docker-env)```

For now, this process will use a separate Dockerfile called 'Dockerfile-dev'. You'll have to build the image using
it by running the following command:

```docker build -t xr3ngine/xr3ngine:v0.0.0 -f Dockerfile-dev .```

Once that image is built, make sure that kubectl is pointed to minikube.
Run ```kubectl config get-contexts``` and there should be a '*' next to minikube; alternatively, run 
```kubectl config current-context```, and it should show minikube.
If it's not, run ```kubectl config set-context minikube``` to change to it.

You'll need to deploy two Kustomize scripts to Minikube.
The first one is the nginx-ingress setup.
Run ```kubectl apply -k kubernetes/nginx/base```.

You'll need to have a file called 'xr3ngine-dev-secrets.env' in kubernetes/xr3ngine/base.
This is in the gitignore to demonstrate that these sorts of files should never be committed.
The production one is expected to be called 'xr3ngine-secrets.env' and is also in the gitignore.
As these are very sensitive files, they should be transmitted to you securely.

Finally run ```kubectl apply -k kubernetes/xr3ngine/base``` to deploy the MariaDB server and xr3ngine.
The server is set up in dev mode to be behind the domain 'api.dev.xr3ngine.io' and is secured by a self-signed certificate.
If you wanted to call one of the endpoints with curl, you could run the following and get a 401 error: 
```curl https://192.168.99.109/user -H HOST:api.dev.xr3ngine.io --insecure```

NOTE: As of this writing, the MariaDB server sometimes finishes initializing after xr3ngine has already tried to
connect to it. To reboot xr3ngine, run the following:

```kubectl rollout restart -n xr3ngine deployments/xr3ngine```

## Migrations

### Generate Migration file

```node_modules/.bin/sequelize migration:generate --name "migration_name"```

### Migrate the database

Before run the server, you should migrate the db.
To do this, please run as following.
```yarn run compile```
```node_modules/.bin/sequelize db:migrate```

### For more information

For more information, please visit here
https://github.com/douglas-treadwell/sequelize-cli-typescript


### DB Init

XR3ngine requires either MariaDB or MySQL as the database backend.

#### Mac OS X (Homebrew)

```
brew install mysql

server
password
```

#### Linux (Ubuntu)

```
sudo apt install mysql-server mysql-client
```

Stop MySQL service

```
sudo /etc/init.d/mysql stop
```

Start MySQL without a password, connect to it.

```
sudo mysqld_safe --skip-grant-tables &
mysql -uroot
```

Note: If you get the error `mysqld_safe Directory '/var/run/mysqld' for UNIX socket file don't exists.`, 
you may need to create the `mysqld` dir, and retry.

```
sudo mkdir -p /var/run/mysqld
sudo chown mysql:mysql /var/run/mysqld
```

Set a new MySQL root password.

```mysql
create database xr3ngine;
create user 'server'@'localhost' identified by 'password';
grant all on xr3ngine.* to 'server'@'localhost';
exit
```

Stop and re-start MySQL service.

```
sudo /etc/init.d/mysql stop
sudo /etc/init.d/mysql start
```

#### Database Setup

Connect as `root`, create the `xr3ngine` db (it will be initialized by the server itself).

```mysql
create database xr3ngine;
create user 'server'@'localhost' identified by 'password';
grant all on xr3ngine.* to 'server'@'localhost';

show databases;
```

Restart db.

mysql.server start
mysql.server stop

#### Resetting the Database

Some major changes to xr3ngine will require you to drop and re-create the database. (And then run the db-init script).

```
mysql -userver -ppassword
```

```mysql
drop database xr3ngine;

create database xr3ngine;
```

### STMP Testing

https://mailtrap.io/inboxes
