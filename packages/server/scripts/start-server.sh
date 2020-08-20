#!/bin/bash
[ "$SERVER_MODE" = "client" ] && node packages/client/lib/index.js
[ "SERVER_MODE" != "client" ] && node packages/server/lib/index.js
