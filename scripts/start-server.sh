#!/bin/bash
[ "$SERVER_MODE" = "analytics" ] && (cd packages/analytics && npm run start)
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && node generate-env-config.js && cd .. && npm run start)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && npm run start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)
