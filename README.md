
![xrengine](https://github.com/XRFoundation/XREngine/raw/dev/xrengine%20black.png)

#### [Join our Discord](https://discord.gg/Tb4MT4TTjH)  
[![Discord Chat](https://img.shields.io/discord/692672143053422678.svg)](https://discord.gg/Tb4MT4TTjH)  

![Sponsorhip](https://opencollective.com/xrengine/tiers/badge.svg)

[![Build Status](https://travis-ci.org/xrengine/xrengine.svg?branch=dev)](https://travis-ci.org/xrengine/xrengine)  

## [Link to Full Documentation](https://xrfoundation.github.io/xrengine-docs/docs/)

## Popular features
- Player rigs to support 2D, 3D and XR interaction
- High-performance ECS engine
- Fully networked player controller, physics, vehicles and particles
- Fully data-oriented design
- Chat, groups, parties and friends
- Voice and video over WebRTC
- Instant login with phone number or email
- OAuth login with Facebook, Google, Steam and Github
- User management, avatars and inventory
- Authorative realtime gameserver
- Reliable messaging and signaling with socket.io
- Fast, unreliable messaging with SCTP data channels
- Built end-to-end in Typescript
- Free, open source, MIT-licensed

# Getting Started

Getting up and running requires only a few steps. 

IF ON WINDOWS, go to Native Windows Preinstall below

For on OSX / Linux / WSL2 for Windows:

First, make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed (and if you are using it, [docker](https://docs.docker.com/)).

## Easy Setup

```
cd path/to/xrengine
npm install
npm run dev
```
This will automatically setup (if necessary) and run redis/mariadb docker containers, and XRengine client/server/game-server instances. That's it!

## Advanced Setup

If you want to setup XREngine docker instances, client, server, and/or game-server manually, follow these directions.

#### 1.  Install your dependencies 
```
cd path/to/xrengine
npm install
```

You should not need to use sudo in any case.

Error with mediasoup? Optional: https://mediasoup.org/documentation/v3/mediasoup/installation/
    
If on WSL2:	
	
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essential
npm install -g node-gyp
npm config set python /usr/bin/python
PYTHON=python3 npm install
```
#### 2. Make sure you have a mysql database installed and running -- our recommendation is Mariadb. 
    
We've provided a docker container for easy setup:

```
cd scripts && sudo bash start-db.sh
```

This creates a Docker container of mariadb named xrengine_db. You must have docker installed on your machine for this script to work.
If you do not have Docker installed and do not wish to install it, you'll have to manually create a MariaDB server.
   
The default username is 'server', the default password is 'password', the default database name is 'xrengine', the default hostname is '127.0.0.1', and the default port is '3306'.
   
   Seeing errors connecting to the local DB? Shut off your local firewall.
#### 3. Have redis installed and running
   redis must be running in order for feathers-sync to function; it coordinates feathers actions
   across servers, e.g. the API server can be notified that the gameserver patched a user.
   ```scrips/docker-compose``` is configured to start a redis container using Docker.
   Run ```docker-compose up``` from the /scripts directory to build + start it, and after that
   you can run ```docker start xrengine_redis``` to restart the redis container.

#### 4. Open a new tab and start the Agones sidecar in local mode

   ```
   cd scripts
   sudo bash start-agones.sh
   ```
   
   You can also go to vendor/agones/ and run
   
   ```./sdk-server.linux.amd64 --local```
   
   If you are using a Windows machine, run
   
   ```sdk-server.windows.amd64.exe --local```
   
   and for mac, run
   
   ```./sdk-server.darwin.amd64 --local```

#### 5. Obtain .env.local file with configuration variable.
   Many parts of XREngine are configured using environment variables.
   For simplicity, it's recommended that you create a file called ```.env.local``` in the top level of xrengine,
   and have all of your ENV_VAR definitions here in the form ```<VAR_NAME>=<VALUE>```.
   If you are actively working on this project, contact one of the developers for a copy of the file
   that has all of the development settings and keys in it.
   
   Copy and Rename ```.env.local.default``` > to > ```env.local```

#### 6. Start the server in database seed mode

   Several tables in the database need to be seeded with default values.
   Run ```cd packages/server```, then run ```npm run dev-reinit-db```.
   After several seconds, there should be no more logging.
   Some of the final lines should read like this:
   ```Executing (default): SELECT 'id', 'name', 'sceneId', 'locationSettingsId', 'slugifiedName', 'maxUsersPerInstance', 'createdAt', 'updatedAt' FROM 'location' AS 'location' WHERE ('location'.'id' = '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61') AND 'location'.'id' IN ('98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61'); Seeded```
   
    At this point, the database has been seeded. You can shut down the server with CTRL+C.

#### 7. Local file server configuration
   If the .env.local file y ou have has the line 
   ```STORAGE_PROVIDER=local```
   then the scene editor will save components, models, scenes, etc. locally 
   (as opposed to storing them on S3). You will need to start a local server
   to serve these files, and make sure that .env.local has the line
   ```LOCAL_STORAGE_PROVIDER="localhost:8642"```.
   In a new tab, go to ```packages/server``` and run ```npm run serve-local-files```.
   This will start up ```http-server``` to serve files from ```packages/server/upload```
   on ```localhost:8642```.
   You may have to accept the invalid self-signed certificate for it in the browser;
   see 'Allow local file http-server connection with invalid certificate' below.
   
#### 8. Open two/three separate tabs and start the API server, gameserverand client
   In /packages/server, run ```npm run dev``` which will launch the api server, game server and file server.
   If you are not using gameservers, you can instead run ```npm run dev-api-server``` in the api server.
   In the final tab, go to /packages/client and run ```npm run dev```.
   
#### 9. In a browser, navigate to https://127.0.0.1:3000/location/test
   The database seeding process creates a test empty location called 'test'.
   It can be navigated to by going to 'https://127.0.0.1:3000/location/test'.
   See the sections below about invalid certificates if you are encountering errors
   connecting to the client, API, or gameserver.

### Native Windows Preinstall

1. Add Env Variable
```
PUPPETEER_SKIP_DOWNLOAD='true'
```
2. install python 2 and add python installation directory path to 'path' env variable.

3. Install node js

4. install Visual studio community edition with build tools. follow next steps. If mediasoup will not installed properly then modify Visual studio setup to add c++ and Node.js support.

5. add environmental variable
```
GYP_MSVS_VERSION=<vs-year>
for example, GYP_MSVS_VERSION=2019
```

6. add path to MSbuild.exe (which is present into vs installation folder) into 'path' variable
for example:``` C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin```

7. remove mediasoup and mediasoup-client from every package.json. This will enable us to add all the dependencies except mediasoup, this way we can save time while dealing with mediasoup.

8. rename 'postinstall' to 'postinstall-1' so that it will not run after installing dependencies.

9. install all dependences using npm.

10. add back all removed mediasoup and mediasoup-client dependencies.

11. Rerun npm command to install dependencies to install newly added mediasoup and mediasoup-client dependencies.

12. If error persists then check for typos in evironment variables.

13. If you are on Windows, you can use docker-compose to start the scripts/docker-compose.yml file, or install mariadb and copy the login/pass and database name from docker-compose or .env.local -- you will need to create the database with the matching name, but you do not need to populate it

./start-db.sh only needs to be run once. If the docker image has stopped, start it again with:

```
    docker container start xrengine_db
```

### OSX DB Native Initialization Commands
```
brew install mysql

mysql_secure_installation
server
password
 
mysql -uroot -ppassword
mysql -userver -ppassword

create database xrengine;
create user 'server'@'127.0.0.1' identified by 'password';
grant all on xrengine.* to 'server'@'127.0.0.1';

show databases;

mysql.server start
mysql.server stop
```
### Troubleshooting

#### Invalid Certificate errors in local environment

As of this writing, the cert provided in the xrengine package for local use
is not adequately signed. Browsers will throw up warnings about going to insecure pages.
You should be able to tell the browser to ignore it, usually by clicking on some sort
of 'advanced options' button or link and then something along the lines of 'go there anyway'.

Chrome sometimes does not show a clickable option on the warning. If so, just
type ```badidea``` or ```thisisunsafe``` when on that page. You don't enter that into the
address bar or into a text box, Chrome is just passively listening for those commands.

##### Allow gameserver address connection via installing local Certificate Authority
For more detailed instructions check: https://github.com/FiloSottile/mkcert

Short version (common for development process on Ubuntu):
1. `sudo apt install libnss3-tools`
2. `brew install mkcert` (if you don't have brew, check it's page: https://brew.sh/)
3. `mkcert --install`
4. navigate to `./certs` folder
5. mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1

##### Allow local file http-server connection with invalid certificate

Open the developer tools in your browser by pressing ```Ctrl+Shift+i``` at the same time. Go to the 'Console'
tab and look at the message history. If there are red errors that say something like
```GET https://127.0.0.1:3030/socket.io/?EIO=3&transport=polling&t=NXlZLTa net::ERR_CERT_AUTHORITY_INVALID```,
then right-click that URL, then select 'Open in new tab', and accept the invalid certificate.

##### Allow gameserver address connection with invalid certificate

The gameserver functionality is hosted on an address other than 127.0.0.1 in the local
environment. Accepting an invalid certificate for 127.0.0.1 will not apply to this address.
Open the dev console for Chrome/Firefox by pressing ```Ctrl+Shift+i``` simultaneously, and
go to the Console or Network tabs. 

If you see errors about not being able to connect to
something like ```https://192.168.0.81:3031/socket.io/?location=<foobar>```, right click on
that URL and open it in a new tab. You should again get a warning page about an invalid
certificate, and you again need to allow it.  

#### AccessDenied connecting to mariadb

Make sure you don't have another instance of mariadb running on port 3306
```
    lsof -i :3306
```

On Linux, you can also check if any processes are running on port 3306 with
```sudo netstat -utlp | grep 3306```
The last column should look like ```<ID>/<something```
You can kill any running process with ```sudo kill <ID>```

#### Error: listen EADDRINUSE :::3030

check which process is using port 3030 and kill
```
    killall -9 node
```

Or

```
    lsof -i :3030
	kill -3 <proccessIDfromPreviousCommand>
```

#### 'TypeError: Cannot read property 'position' of undefined' when accessing /location/home
    As of this writing, there's a bug with the default seeded test location.
    Go to /editor/projects and open the 'Test' project. Save the project, and
    the error should go away.

#### Weird issues with your database?
Try
```
npm run dev-reinit-db // in server package
```

## Admin System

How to make a user an admin:

Create a user at `/login`

Method 1: 

1. Run `node scripts/make-user-admin.js --id=[USER ID]` 
2. TODO: Improve with email/phone ID support

Method 2: 
1. Look up in User table and change userRole to 'admin' 
2. Dev DB credentials can be found here: packages/ops/docker-compose-local.yml#L42
3. Suggested: beekeeperstudio.io

Test user Admin privliges by going to `/admin`

# Development

## API Reference
[Open API](https://api-dev.theoverlay.io/openapi/)

## Code Reference

### [Developer Reference](https://docs.google.com/document/d/1_nCi0CL5b7wVPi-Mj77XZ939xo5ztXLaxtYAfzHsvPo)

# Deployment

[AWS EKS Deployment](https://github.com/XRFoundation/XREngine/blob/dev/packages/ops/docs/AWS-setup.md)

[Managing Kubernets](https://github.com/XRFoundation/XREngine/blob/dev/packages/ops/docs/managing_remote_kubernets.md)

[Managing Helm Charts](https://github.com/XRFoundation/XREngine/blob/dev/packages/ops/docs/release-helm-chart.md)

[Cloudformation Scripts](https://github.com/XRFoundation/XREngine/blob/dev/packages/ops/xrengine-cloudformation)

## Testing
### Integration Tests

Simply run `npm run test` and all the tests in the `tests/` directory will be run.
This will launch the whole xrengine development environment, so any existing processes (including the database + utils, client & servers) should be stopped.

## Unit Tests

The engine and server packages have tests. These can be ran individually by navigating to the package and running `npm run test`.
Individual files can be tested via `npx jest ./tests/file.test.js`.

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

### Docker image configurations

Enviroment variables:
- `NODE_ENV` controls the config/*.js file for feathers.js to load [default: production]
- `PORT` controls the listening port [default: 3030]
- `MYSQL_URL` e.g. `mysql://<user>:<pass>@<host>:<port>/<db>` points to MariaDB server with a username and password

### Run in Kubernetes locally

First, you'll need minikube installed and running, as well as kubectl. Next, you'll want to point your shell to minikube's docker-env
so that you don't need to push the Docker image to an external repository. Run the following:

```eval $(minikube docker-env)```

For now, this process will use a separate Dockerfile called 'Dockerfile-dev'. You'll have to build the image using
it by running the following command:

```docker build -t xrengine/xrengine:v0.0.0 -f Dockerfile-dev .```

Once that image is built, make sure that kubectl is pointed to minikube.
Run ```kubectl config get-contexts``` and there should be a '*' next to minikube; alternatively, run 
```kubectl config current-context```, and it should show minikube.
If it's not, run ```kubectl config set-context minikube``` to change to it.

You'll need to deploy two Kustomize scripts to Minikube.
The first one is the nginx-ingress setup.
Run ```kubectl apply -k kubernetes/nginx/base```.

You'll need to have a file called 'xrengine-dev-secrets.env' in kubernetes/xrengine/base.
This is in the gitignore to demonstrate that these sorts of files should never be committed.
The production one is expected to be called 'xrengine-secrets.env' and is also in the gitignore.
As these are very sensitive files, they should be transmitted to you securely.

Finally run ```kubectl apply -k kubernetes/xrengine/base``` to deploy the MariaDB server and xrengine.
The server is set up in dev mode to be behind the domain 'api.dev.xrengine.dev' and is secured by a self-signed certificate.
If you wanted to call one of the endpoints with curl, you could run the following and get a 401 error: 
```curl https://192.168.99.109/user -H HOST:api.dev.xrengine.dev --insecure```

NOTE: As of this writing, the MariaDB server sometimes finishes initializing after xrengine has already tried to
connect to it. To reboot xrengine, run the following:

```kubectl rollout restart -n xrengine deployments/xrengine```


### SMTP Testing

https://mailtrap.io/inboxes

add credentials in ```packages/server/.env```
```dotenv
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=<mailtrap-user>
SMTP_PASS=<mailtrap-password>
```


## Scaffolding (Server Only)

Feathers.js has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers help                           # Show all commands
```


## Backend API Help

For more information on all the things you can do with Feathers visit [docs.feathersjs.com](http://docs.feathersjs.com).


## Migrations

### Generate Migration file

```node_modules/.bin/sequelize migration:generate --name "migration_name"```

### Migrate the database

Before run the server, you should migrate the db.
To do this, please run as following.
```npm run compile```
```node_modules/.bin/sequelize db:migrate```

### For more information

For more information, please visit here
https://github.com/douglas-treadwell/sequelize-cli-typescript

## Browser Debug

```p key``` debug colliders view
