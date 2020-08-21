#!/bin/bash
[ "$SERVER_MODE" = "client" ] && node packages/client/dist/index.js
[ "$SERVER_MODE" != "client" ] && node packages/server/dist/server.js
