# not slim because we need github depedencies
FROM node:16-buster-slim

RUN apt-get update
RUN apt-get install -y build-essential meson python3-testresources python3-venv python3-pip git procps
# Create app directory
WORKDIR /app

RUN npm install -g npm lerna cross-env rimraf --loglevel notice

# to make use of caching, copy only package files and install dependencies
COPY package.json .
COPY packages/analytics/package.json ./packages/analytics/
COPY packages/client/package.json ./packages/client/
COPY packages/client-core/package.json ./packages/client-core/
COPY packages/common/package.json ./packages/common/
COPY packages/editor/package.json ./packages/editor/
COPY packages/engine/package.json ./packages/engine/
COPY packages/instanceserver/package.json ./packages/instanceserver/
COPY packages/hyperflux/package.json ./packages/hyperflux/
COPY packages/engine/package.json ./packages/engine/
COPY packages/matchmaking/package.json ./packages/matchmaking/
COPY packages/server/package.json ./packages/server/
COPY packages/server-core/package.json ./packages/server-core/
COPY packages/projects/package.json ./packages/projects/
COPY project-package-jsons ./

#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds

ARG NODE_ENV
RUN npm install --loglevel notice --legacy-peer-deps

COPY . .

# copy then compile the code

ARG MYSQL_HOST
ARG MYSQL_PORT
ARG MYSQL_USER
ARG MYSQL_PASSWORD
ARG MYSQL_DATABASE
ARG VITE_CLIENT_HOST
ARG VITE_CLIENT_PORT
ARG VITE_SERVER_HOST
ARG VITE_SERVER_PORT
ARG VITE_MEDIATOR_SERVER
ARG VITE_LOGIN_WITH_WALLET
ARG VITE_INSTANCESERVER_HOST
ARG VITE_INSTANCESERVER_PORT
ARG VITE_LOCAL_BUILD
ENV MYSQL_HOST=$MYSQL_HOST
ENV MYSQL_PORT=$MYSQL_PORT
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_PASSWORD=$MYSQL_PASSWORD
ENV MYSQL_DATABASE=$MYSQL_DATABASE
ENV VITE_CLIENT_HOST=$VITE_CLIENT_HOST
ENV VITE_CLIENT_PORT=$VITE_CLIENT_PORT
ENV VITE_SERVER_HOST=$VITE_SERVER_HOST
ENV VITE_SERVER_PORT=$VITE_SERVER_PORT
ENV VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER
ENV VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET
ENV VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST
ENV VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT
ENV VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD

ARG CACHE_DATE
RUN npm run check-db-exists
RUN npm run build-client

ENV APP_ENV=production

CMD ["scripts/start-server.sh"]
