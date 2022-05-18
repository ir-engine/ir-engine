# Installing on Mac OS X

1. Go to the root and run

```
npm install
npm run dev-docker
npm run dev-reinit
```

Or if you are on a M1 based Mac

(Recommended)
1) Duplicate the Terminal app, and configure it to run in Rosetta
2) Run the above in Rosetta Terminal

(Not recommended)
```
yarn install
```

This is because on Apple chips the node-darwin sometimes doesn't get installed
properly and by using yarn it fixes the issue.

2. Have docker started in the background and then in the terminal type

```
npm run dev
```

This will open the mariaDB and SQL scripts on the docker and will start the servers

3. To make sure your environment is set and running properly just go to
   https://localhost:3000/location/default and you should be able to walk around an empty 3D scene

```
Note : Make sure you are on Node >= 16 and have docker running. 
```

## Troubleshooting Mac

* If you find issues on your terminal that says that access-denied for user
  `server@localhost` then you can use this command

```
brew services stop mysql
```

* If you find issue on your terminal that says
  `An unexpected error occurred: "expected workspace package`
  while using yarn then you can use this command in your terminal

```
yarn policies set-version 1.18.0
```

As yarn > 1.18 sometimes doesn't work properly with lerna.
