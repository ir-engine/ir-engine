# not slim because we need github depedencies
FROM node:18-buster-slim

RUN apt-get update
RUN apt-get install -y build-essential meson python3-testresources python3-venv python3-pip git procps git-lfs
# Create app directory
WORKDIR /app

RUN npm install -g npm lerna cross-env rimraf --loglevel notice

# to make use of caching, copy only package files and install dependencies
COPY package.json .
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
COPY packages/taskserver/package.json ./packages/taskserver/
COPY packages/xrui/package.json ./packages/xrui/
COPY packages/ui/package.json ./packages/ui/
COPY packages/projects/package.json ./packages/projects/
COPY project-package-jsons ./
COPY patches/ ./patches/

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
ARG SERVER_HOST
ARG SERVER_PORT
ARG VITE_APP_HOST
ARG VITE_APP_PORT
ARG VITE_SERVER_HOST
ARG VITE_SERVER_PORT
ARG VITE_FILE_SERVER
ARG VITE_MEDIATOR_SERVER
ARG VITE_LOGIN_WITH_WALLET
ARG VITE_8TH_WALL
ARG VITE_INSTANCESERVER_HOST
ARG VITE_INSTANCESERVER_PORT
ARG VITE_LOCAL_BUILD
ARG VITE_READY_PLAYER_ME_URL
ARG VITE_DISABLE_LOG
ENV MYSQL_HOST=$MYSQL_HOST
ENV MYSQL_PORT=$MYSQL_PORT
ENV MYSQL_USER=$MYSQL_USER
ENV MYSQL_PASSWORD=$MYSQL_PASSWORD
ENV MYSQL_DATABASE=$MYSQL_DATABASE
ENV SERVER_HOST=$SERVER_HOST
ENV SERVER_PORT=$SERVER_PORT
ENV VITE_APP_HOST=$VITE_APP_HOST
ENV VITE_APP_PORT=$VITE_APP_PORT
ENV VITE_SERVER_HOST=$VITE_SERVER_HOST
ENV VITE_SERVER_PORT=$VITE_SERVER_PORT
ENV VITE_FILE_SERVER=$VITE_FILE_SERVER
ENV VITE_MEDIATOR_SERVER=$VITE_MEDIATOR_SERVER
ENV VITE_LOGIN_WITH_WALLET=$VITE_LOGIN_WITH_WALLET
ENV VITE_8TH_WALL=$VITE_8TH_WALL
ENV VITE_INSTANCESERVER_HOST=$VITE_INSTANCESERVER_HOST
ENV VITE_INSTANCESERVER_PORT=$VITE_INSTANCESERVER_PORT
ENV VITE_LOCAL_BUILD=$VITE_LOCAL_BUILD
ENV VITE_READY_PLAYER_ME_URL=$VITE_READY_PLAYER_ME_URL
ENV VITE_DISABLE_LOG=$VITE_DISABLE_LOG

ARG CACHE_DATE
RUN npx cross-env ts-node --swc scripts/check-db-exists.ts
RUN npm run build-client

RUN rm -r packages/client/public

RUN bash ./scripts/setup_helm.sh

ENV APP_ENV=production

CMD ["scripts/start-server.sh"]
