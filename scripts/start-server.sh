#!/bin/bash
[ "$SERVER_MODE" = "analytics" ] && (cd packages/analytics && npm run start)
[ "$SERVER_MODE" = "client" ] && (npm run install-reality-packs && cd packages/client && cat ../realitypacks/loader.ts && npm run build && cd scripts && node generate-env-config.js && cd .. && npm run start)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/gameserver && npm run start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)