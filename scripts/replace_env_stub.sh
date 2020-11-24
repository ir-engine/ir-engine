#!/usr/bin/env bash

set -e
set -x

TEMP_DIST_PATH="./.next"

export NEXT_PUBLIC_API_SERVER_OLD="$(echo "NEXT_PUBLIC_API_SERVER" | sha256sum | cut -d' ' -f1)"

# Replace base assets path in static references
find $TEMP_DIST_PATH -type f -name "*.html" -exec sed -i "s+${NEXT_PUBLIC_API_SERVER_OLD}+${NEXT_PUBLIC_API_SERVER}+g" {} \;
find $TEMP_DIST_PATH -type f -name "*.css" -exec sed -i "s+${NEXT_PUBLIC_API_SERVER_OLD}+${NEXT_PUBLIC_API_SERVER}+g" {} \;
find $TEMP_DIST_PATH -type f -name "*.js" -exec sed -i "s+${NEXT_PUBLIC_API_SERVER_OLD}+${NEXT_PUBLIC_API_SERVER}+g" {} \;
