# not slim because we need github depedencies
FROM node:16-buster

RUN echo "deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ eoan nginx\ndeb-src http://nginx.org/packages/mainline/ubuntu/ eoan nginx" >> /etc/apt/sources.list.d/nginx.list
RUN wget http://nginx.org/keys/nginx_signing.key
RUN apt-key add nginx_signing.key
# ffmpeg 4+ is required
RUN apt update && apt install -y ffmpeg=*:4.** nginx
# Create app directory
WORKDIR /app

RUN npm install -g lerna cross-env rimraf --loglevel notice

# to make use of caching, copy only package files and install dependencies
COPY package.json .
COPY packages/client/package.json ./packages/client/
COPY packages/client-core/package.json ./packages/client-core/
COPY packages/client-ml/package.json ./packages/client-ml/
COPY packages/common/package.json ./packages/common/
COPY packages/engine/package.json ./packages/engine/
COPY packages/gameserver/package.json ./packages/gameserver/
COPY packages/server/package.json ./packages/server/
COPY packages/server-core/package.json ./packages/server-core/
COPY packages/social/package.json ./packages/social/
COPY packages/bot/package.json ./packages/bot/

#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds
RUN npm install --production=false --loglevel notice --legacy-peer-deps

COPY . .

# copy then compile the code

RUN npm run build-docker

ENV NODE_ENV=production
ENV PORT=3030

EXPOSE 3030
CMD ["scripts/start-server.sh"]
