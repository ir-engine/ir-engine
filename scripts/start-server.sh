#!/bin/bash
[ "$SERVER_MODE" = "client" ] && (cd packages/client && node index.js)
[ "$SERVER_MODE" != "client" ] && (cd packages/server && node dist/server.js)
