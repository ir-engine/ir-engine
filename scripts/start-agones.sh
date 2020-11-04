#!/usr/bin/env bash
echo -e "\e[32mStarting Agones sidecar for local development..."
cd ../vendor/agones && ./sdk-server.linux.amd64 --local