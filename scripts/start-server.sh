#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && sh generate-env-config.sh && cd .. && yarn run start)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && node dist/server.js)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && node dist/server.js)
