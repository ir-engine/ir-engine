#!/bin/bash
set -x

# Start database containers and agones
npx ttab -t 'agones-local' './start-all-docker.sh; ./start-agones.sh'

sleep 1

## Start client
npx ttab -t 'ir-engine-client' -d ../packages/client npm run dev

## Start api server
npx ttab -t 'ir-engine-api' -d ../packages/server npm run dev-api-server

## Start world instanceserver
npx ttab -t 'ir-engine-world-instanceserver' -d ../packages/instanceserver npm run dev

## Start channel instanceserver
npx ttab -t 'ir-engine-channel-instanceserver' -d ../packages/instanceserver npm run dev-channel