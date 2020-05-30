#!/bin/bash
echo -e "\e[32mInitializing Mozilla Spoke"

echo -e "\e[32mCopying custom files..."

# Copy Configs.js
cp ../spoke/configs.js ../node_modules/xrchat-spoke/src/configs.js
# look through new file and replace routes so no errors

# Copy Api.js
cp ../spoke/Api.js ../node_modules/xrchat-spoke/src/api/Api.js
# look through new file and replace routes so no errors

# style overrides?
cp ../spoke/theme.js ../node_modules/xrchat-spoke/src/ui/theme.js
cp ../spoke/GlobalStyle.js ../node_modules/xrchat-spoke/src/ui/GlobalStyle.js

#.env?
cp ../spoke/.env.defaults ../node_modules/xrchat-spoke/.env.defaults


# Copy 
echo -e "\e[32mStarting Mozilla Spoke"

cd ../node_modules/xrchat-spoke && npm start