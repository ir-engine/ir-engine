#!/bin/bash
set -x

# Start database containers and agones
ttab -t 'agones-local' './start-all-docker.sh; ./start-agones.sh'

sleep 1

# Start serve-local-files
ttab -t 'serve-local-files' -d ../packages/server npm run serve-local-files

## Start client
ttab -t 'xrengine-client' -d ../packages/client npm run dev

## Start api server
ttab -t 'xrengine-api' -d ../packages/server npm run dev-api-server

## Start world instanceserver
ttab -t 'xrengine-world-instanceserver' -d ../packages/instanceserver npm run dev
#
## Start channel instanceserver
ttab -t 'xrengine-channel-instanceserver' -d ../packages/instanceserver npm run dev-channel