#!/bin/bash
[ "$SERVER_MODE" = "analytics" ] && (cd packages/analytics && npm run start)
<<<<<<< HEAD
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && node generate-env-config.js && cd .. && node dist/server.js)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && npm run golf)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)
=======
[ "$SERVER_MODE" = "client" ] && (cd packages/client/scripts && node generate-env-config.js && cd .. && npm run start)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && npm run start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)
>>>>>>> origin/dev
