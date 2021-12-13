---
id: installation
title: Installation
---

Getting up and running requires only a few steps.

IF ON WINDOWS, go to Native Windows Preinstall below

For on OSX / Linux / WSL2 for Windows:

First, make sure you have [NodeJS](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed (and if you are using it, [docker](https://docs.docker.com/)). Also make sure that [Python 3](https://realpython.com/installing-python/) is installed with pip.

1. Install your dependencies
    ```
    cd path/to/xrengine
    npm install
    ```
    Error with mediasoup? Optional: https://mediasoup.org/documentation/v3/mediasoup/installation/

    If on WSL2:
	```
	sudo apt-get update
	sudo apt-get install build-essential
	npm install
	```
2. Make sure you have a mysql database installed and running -- our recommendation is Mariadb. We've provided a docker container for easy setup:
    ```
    cd scripts && sudo bash start-db.sh
    ```
    This creates a Docker container of mariadb named xrengine_db. You must have docker installed on your machine for this script to work.
    If you do not have Docker installed and do not wish to install it, you'll have to manually create a MariaDB server.

   The default username is 'server', the default password is 'password', the default database name is 'xrengine', the default hostname is '127.0.0.1', and the default port is '3306'.

   Seeing errors connecting to the local DB? Shut off your local firewall.

3. Open a new tab and start the Agones sidecar in local mode

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

4. Copy .env.local.default to .env.local
   Many parts of XREngine are configured using environment variables.   
   When running it locally, these are sourced from a file called ```.env.local```. 
   The ENV_VAR definitions here in are the form ```<VAR_NAME>=<VALUE>```.
   
   The repo includes a ```.env.local.default``` file. You can copy this to ```.env.local```, and XREngine will run.
   Certain things that require authorization, however, like logging in via email/phone number/OAuth, will not function
   since the associated keys are not committed. If you need to test this functionality, either procure your own
   accounts and keys, or ask on the XREngine Discord for copies of these keys (you'd probably already have
   gotten keys from a dev already if you're part of the team and needed them - they are not given out freely).
   
5. Start the server in database seed mode

   Several tables in the database need to be seeded with default values.
   Run ```cd packages/server```, then run ```npm run dev-reinit-db```.
   After several seconds, there should be no more logging.
   Some of the final lines should read like this:
   ```Executing (default): SELECT 'id', 'name', 'sceneId', 'locationSettingsId', 'slugifiedName', 'maxUsersPerInstance', 'createdAt', 'updatedAt' FROM 'location' AS 'location' WHERE ('location'.'id' = '98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61') AND 'location'.'id' IN ('98cbcc30-fd2d-11ea-bc7c-cd4cac9a8d61'); Seeded```

    At this point, the database has been seeded. You can shut down the server with CTRL+C.

6. Open two separate tabs and start the server (non-seeding) and the client
   In /packages/server, run ```sudo npm run dev```.
   In the other tab, go to /packages/client and run ```sudo npm run dev```.

7. In a browser, navigate to https://127.0.0.1:3000/location/home
   The database seeding process creates a test empty location called 'test'.
   It can be navigated to by going to 'https://127.0.0.1:3000/location/home'.
   See the sections below about invalid certificates if you are encountering errors
   connecting to the client, API, or gameserver.

   ### Native Windows Preinstall

   1. install python 3 and add python installation directory path to 'path' env variable.

   2. Install node js

   3. install Visual studio community edition with build tools. follow next steps. If mediasoup will not installed properly then modify Visual studio setup to add c++ and Node.js support.

   4. add path to MSbuild.exe (which is present into vs installation folder) into 'path' variable
   for example:``` C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin```

   5. install all dependences using npm.

   6. If error persists then check for typos in evironment variables.

   7. If you are on Windows, you can use docker-compose to start the scripts/docker-compose.yml file, or install mariadb and copy the login/pass and database name from docker-compose or .env.local -- you will need to create the database with the matching name, but you do not need to populate it

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