#!/bin/bash
[ "$SERVER_MODE" = "client" ] && npm run build-spoke
node lib/server/index.js
