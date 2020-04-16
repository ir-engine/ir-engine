# this file generates a very large image, because it uses full node image on debian
# and because package.json is not optimized and pulls AFrame and three.js from github 
# this is ok in development and internal builds initially and once optimized we can switch to 2-stage builds

# not slim because we need github depedencies
FROM node:12.16

# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package*.json /app/
#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds
RUN  npm install --no-progress --verbose

# Build Args, NOTE: supplied at build time, not runtime
#ARG API_SERVER_URL=http://localhost:3030

# copy then compile the code
COPY . .
RUN npm run build


EXPOSE 80
CMD [ "npm", "start" ]
