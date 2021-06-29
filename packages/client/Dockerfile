# this file generates a very large image, because it uses full node image on debian
# and because package.json is not optimized and pulls AFrame and three.js from github 
# this is ok in development and internal builds initially and once optimized we can switch to 2-stage builds

# not slim because we need github depedencies
FROM node:lts-buster

# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package*.json /app/
#RUN  yarn ci --verbose  # we should make lockfile or shrinkwrap then use yarn ci for predicatble builds
RUN npm install --no-progress --verbose

# copy then compile the code
COPY . .

RUN /bin/bash -c 'source npm run build'

EXPOSE 80
CMD ["/bin/bash", "-c", "npm run start" ]
