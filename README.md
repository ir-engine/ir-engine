# XRChat Client

This is the front end for the XRChat client

To run
```
yarn install
yarn build
yarn run dev
```

The client is built on Networked Aframe and React, and uses Nextjs for simplified page routing and Server Side Rendering

Typescript and strict linting are enforced

TODO: Add all dependencies, explain each component and our decision to use, add links to tutorials


## Docker

You can run it using docker, if you don't have node installed or need to test.
``` bash
# Build the image
docker build --tag xrchat-client .

# Run the image (deletes itself when you close it)
docker run -d --rm --name client -e "API_SERVER_URL=http://localhost:3030" -p "3000:3000"  xrchat-client

# Stop the server
docker stop client
```

### Docker image configurations

This image uses build-time arguments, they are not used during runtime yet

- `NODE_ENV` controls the config/*.js file to load and build against [default: production]
- `API_SERVER_URL` points to an instance of the xrchat-server [default: http://localhost:3030]
