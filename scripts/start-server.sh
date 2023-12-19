#!/bin/bash
APP_ENV=$1
[ "$SERVER_MODE" = "task" ] && (cd packages/taskserver && npm run start)
if [ "$APP_ENV" = "development" ]; then
    [ "$SERVER_MODE" = "client" ] && (cd packages/client && npm run dev)
  else
    [ "$SERVER_MODE" = "client" ] && (cd packages/client && npm run start)
fi
[ "$SERVER_MODE" = "realtime" ] && (cd packages/instanceserver && npm run start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)