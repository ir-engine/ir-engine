#!/bin/bash
[ "$SERVER_MODE" = "task" ] && (cd packages/taskserver && npm run start)
[ "$SERVER_MODE" = "client" ] && (cd packages/client && npm run start)
[ "$SERVER_MODE" = "realtime" ] && (cd packages/instanceserver && npm run start)
[ "$SERVER_MODE" = "api" ] && (cd packages/server && npm run start)