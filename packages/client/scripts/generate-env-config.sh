#!/bin/bash

# Recreate config file
rm -rf ../public/env-config.js
touch ../public/env-config.js

# Add assignment
echo "window.env = " >> ../public/env-config.js

echo $NODE_CONFIG >> ../public/env-config.js