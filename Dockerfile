# not slim because we need github depedencies
FROM node:12.16

# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package*.json /app/
#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds
RUN  npm isntall --no-progress --verbose

# Build Args
ARG API_SERVER_URL=http://localhost:3030

# copy then compile the code
COPY . .
RUN npm run compile
RUN rm ./src -rf

ENV DEBUG *,-not_this,-express:*,-body-parser:*

EXPOSE 80
CMD [ "npm", "start" ]
