#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && node generate-production-json.js && cd .. && node dist/server.js)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && node dist/server.js)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && node dist/server.js)
