#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client && npm run start)
[ "$SERVER_MODE" != "client" ] && (cd packages/server && DEBUG=* node dist/server.js)
