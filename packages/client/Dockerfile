# not slim because we need github depedencies
FROM node:lts-buster as builder

RUN echo "deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ eoan nginx\ndeb-src http://nginx.org/packages/mainline/ubuntu/ eoan nginx" >> /etc/apt/sources.list.d/nginx.list
RUN wget http://nginx.org/keys/nginx_signing.key
RUN apt-key add nginx_signing.key
RUN apt update && apt install -y nginx
# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package.json .

RUN yarn install --production=false

# copy then compile the code
COPY . .

RUN yarn run build

FROM node:lts-buster as dist-only
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/src/server.js ./src/server.js

ENV BUILD_MODE=individual
EXPOSE 3030
CMD ["/bin/bash", "-c", "cd scripts && node generate-env-config.js && cd .. && node dist/server.js" ]
