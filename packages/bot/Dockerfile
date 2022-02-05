# not slim because we need github depedencies
FROM node:16-buster-slim

RUN echo "deb [arch=amd64] http://nginx.org/packages/mainline/ubuntu/ eoan nginx\ndeb-src http://nginx.org/packages/mainline/ubuntu/ eoan nginx" >> /etc/apt/sources.list.d/nginx.list
RUN wget http://nginx.org/keys/nginx_signing.key
RUN apt-key add nginx_signing.key
RUN apt update && apt install -y libasound2 libatk1.0-0 libatk-bridge2.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 libgbm-dev lsb-release xdg-utils wget
# Create app directory
WORKDIR /app

# to make use of caching, copy only package files and install dependencies
COPY package.json .

#RUN  yarn ci --verbose  # we should make lockfile or shrinkwrap then use yarn ci for predictable builds
RUN yarn install --production=false

COPY . .

# copy then compile the code

ENV APP_ENV=production
ENV PORT=3030

EXPOSE 3030
CMD ["scripts/start-bot.sh"]
