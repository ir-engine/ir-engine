#!/bin/bash

echo -e "\e[32mInitializing mariadb..."
docker stop xrchat_db
docker rm xrchat_db
docker-compose up