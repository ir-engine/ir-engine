#!/usr/bin/env bash


if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo -e "\e[32mStarting Agones sidecar for local development on Linux...";
        cd ../vendor/agones && ./sdk-server.linux.amd64 --local;
elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo -e "\e[32mStarting Agones sidecar for local development on Mac...";
        cd ../vendor/agones && ./sdk-server.darwin.amd64 --local;
elif [[ "$OSTYPE" == "cygwin" ]]; then
        echo -e "\e[32mStarting Agones sidecar for local development on Cygwin (not tested)...";
        cd ../vendor/agones && ./sdk-server.windows.amd64 --local;
elif [[ "$OSTYPE" == "msys" ]]; then
        echo -e "\e[32mStarting Agones sidecar for local development on Msys (not tested)...";
        cd ../vendor/agones && ./sdk-server.windows.amd64 --local;
elif [[ "$OSTYPE" == "win32" ]]; then
        echo -e "\e[32Win32 detected, no support...";
fi