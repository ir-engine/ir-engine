#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client && yarn run start)
[ "$SERVER_MODE" != "client" ] && (cd packages/server && node dist/server.js)
