#!/usr/bin/env bash
echo -e "\e[32mInitializing mariadb..."
docker stop xr3ngine
docker rm xr3ngine
docker-compose up