# Installing on Windows 10+
1. install python 3 and add python installation directory path to 'path' env variable.
2. Install node js
3. install Visual studio community edition with build tools. follow next steps.
   If mediasoup will not installed properly then modify Visual studio setup to
   add c++ and Node.js support.
4. add path to MSbuild.exe (which is present into vs installation folder)
   into 'path' variable (for example:` C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin`)
5. install all dependencies using `npm`.
6. If error persists then check for typos in environment variables.
7. If you are on Windows, you can use docker-compose to start the `scripts/docker-compose.yml`
   file, or install mariadb and copy the login/pass and database name from
   docker-compose or `.env.local` -- you will need to create the database with
   the matching name, but you do not need to populate it

`./start-db.sh` only needs to be run once. If the docker image has stopped,
start it again with:

```
docker container start xrengine_db
```

8. Check your WSL Config for any incorrect networking settings.
   https://docs.microsoft.com/en-us/windows/wsl/wsl-config#network

### Installing on Windows with WSL2
Note: **You must have WSL2 installed for these instructions to work**

First, open a wsl prompt. Then type these commands:
```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install build-essential
npm install
npm install mediasoup@3 --save
sudo service docker start
npm run dev-docker
npm run dev-reinit
```
