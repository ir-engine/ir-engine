#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && node generate-env-config.js && cd .. && node dist/server.js)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && yarn start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && yarn start)
