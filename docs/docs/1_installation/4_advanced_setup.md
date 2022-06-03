# Advanced Setup

If you want to setup XREngine docker instances, client, server, and/or
game-server manually, follow these directions. The advanced setup is recommended
for all users, in order to understand more about everything that going on.

### 1.  Install your dependencies
```
cd path/to/xrengine
npm install
npm run dev-docker
npm run dev-reinit
```

You should not need to use sudo in any case.

Error with mediasoup? https://mediasoup.org/documentation/v3/mediasoup/installation/

### 2. Make sure you have a mysql database installed and running -- our recommendation is Mariadb.

We've provided a docker container for easy setup:

```
cd scripts && sudo bash start-db.sh
```

This creates a Docker container of mariadb named xrengine_db. You must have
docker installed on your machine for this script to work.
If you do not have Docker installed and do not wish to install it, you'll have
to manually create a MariaDB server.

The default username is 'server', the default password is 'password', the
default database name is 'xrengine', the default hostname is '127.0.0.1', and
the default port is `3306`.

Seeing errors connecting to the local DB? **Try shutting off your local firewall.**

### 3. Open a new tab and start the Agones sidecar in local mode

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

### 4. Start the server in database seed mode

Several tables in the database need to be seeded with default values.
Run ```npm run dev-reinit``` or if on windows ```npm run dev-reinit-windows```
After several seconds, there should be no more logging.
Some of the final lines should read like this:
```
Server Ready
Executing (default): SET FOREIGN_KEY_CHECKS = 1
Server EXIT
```

At this point, the database has been seeded.

### 5. Local file server configuration
If the .env.local file you have has the line
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

### 6. Open two/three separate tabs and start the API server, gameserver and client
In /packages/server, run ```npm run dev``` which will launch the api server, game server and file server.
If you are not using gameservers, you can instead run ```npm run dev-api-server``` in the api server.
In the final tab, go to /packages/client and run ```npm run dev```.
If you are on windows you need to use ```npm run dev-windows``` instead of ```npm run dev```.

### 7. In a browser, navigate to https://127.0.0.1:3000/location/default
The database seeding process creates a default empty location called 'default'.
It can be navigated to by going to 'https://127.0.0.1:3000/location/default'.
As of this writing, the cert provided in the XREngine package for local use is
not adequately signed. You can create signed certificates and replace the
default ones, but most developers just ignore the warnings. Browsers will throw
up warnings about going to insecure pages. You should be able to tell the browser
to ignore it, usually by clicking on some sort of 'advanced options' button or
link and then something along the lines of 'go there anyway'.
