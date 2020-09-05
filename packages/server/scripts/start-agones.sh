#!/usr/bin/env bash
echo -e "\e[32mStarting Agones sidecar for local development..."
cd ../bin/agones && ./sdk-server.linux.amd64 --local