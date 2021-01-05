# not slim because we need github depedencies
FROM node:12.16-buster

RUN echo "deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ eoan nginx\ndeb-src http://nginx.org/packages/mainline/ubuntu/ eoan nginx" >> /etc/apt/sources.list.d/nginx.list
RUN wget http://nginx.org/keys/nginx_signing.key
RUN apt-key add nginx_signing.key
RUN apt update
# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package.json .

#RUN  npm ci --verbose  # we should make lockfile or shrinkwrap then use npm ci for predicatble builds
RUN yarn install --production=false

COPY . .

# copy then compile the code

ENV NODE_ENV=production
ENV PORT=3030

EXPOSE 3030
CMD ["node run-bot.js"]
