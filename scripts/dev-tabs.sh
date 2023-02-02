#!/bin/bash
set -x

# Start database containers and agones
npx ttab -t 'agones-local' './start-all-docker.sh; ./start-agones.sh'

sleep 1

# Start serve-local-files
npx ttab -t 'serve-local-files' -d ../packages/server npm run serve-local-files

## Start client
npx ttab -t 'xrengine-client' -d ../packages/client npm run dev

## Start api server
npx ttab -t 'xrengine-api' -d ../packages/server npm run dev-api-server

## Start world instanceserver
npx ttab -t 'xrengine-world-instanceserver' -d ../packages/instanceserver npm run dev

## Start channel instanceserver
npx ttab -t 'xrengine-channel-instanceserver' -d ../packages/instanceserver npm run dev-channel

## Start task server
npx ttab -t 'xrengine-taskserver' -d ../packages/taskserver npm run dev