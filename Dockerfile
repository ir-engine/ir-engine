# not slim because we need github depedencies
FROM node:12.16-buster

RUN echo "deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ eoan nginx\ndeb-src http://nginx.org/packages/mainline/ubuntu/ eoan nginx" >> /etc/apt/sources.list.d/nginx.list
RUN wget http://nginx.org/keys/nginx_signing.key
RUN apt-key add nginx_signing.key
# ffmpeg 4+ is required
RUN apt update && apt install -y ffmpeg=*:4.** nginx
# Create app directory
WORKDIR /app

RUN yarn global add lerna --loglevel notice

# to make use of caching, copy only package files and install dependencies
COPY package.json .
COPY packages/client/package.json ./packages/client/
COPY packages/client-core/package.json ./packages/client-core/
COPY packages/common/package.json ./packages/common/
COPY packages/engine/package.json ./packages/engine/
COPY packages/server/package.json ./packages/server/
COPY packages/social/package.json ./packages/social/
COPY packages/capacitor-plugin-xr/package.json ./packages/capacitor-plugin-xr/
COPY packages/volumetric/package.json ./packages/volumetric/
COPY packages/bot/package.json ./packages/bot/

#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds
RUN yarn install --production=false

COPY . .

# copy then compile the code

#RUN /bin/bash -c 'source ./scripts/write_env_stub.sh'
#ENV NEXT_PUBLIC_API_SERVER=http://127.0.0.1:3333

RUN yarn run build-docker

ENV NODE_ENV=production
ENV PORT=3030

EXPOSE 3030
CMD ["scripts/start-server.sh"]
