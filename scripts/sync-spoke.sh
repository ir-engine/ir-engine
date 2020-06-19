#!/bin/bash
echo -e "\e[32mInitializing Mozilla Spoke"

echo -e "\e[32mCopying custom files..."

# Copy Configs.js
cp ../spoke/configs.js ../node_modules/xr3-spoke/src/configs.js
# look through new file and replace routes so no errors

# Copy Api.js
cp ../spoke/Api.js ../node_modules/xr3-spoke/src/api/Api.js
# look through new file and replace routes so no errors

# Copy custom files
cp ../spoke/BlockSearchTerms.js ../node_modules/xr3-spoke/src/api/BlockSearchTerms.js
cp ../spoke/CustomComponents/ui/projects/CreateProjectPage.js ../node_modules/xr3-spoke/src/ui/projects/CreateProjectPage.js

# look through new file and replace routes so no errors

# style overrides?
cp ../spoke/theme.js ../node_modules/xr3-spoke/src/ui/theme.js
cp ../spoke/GlobalStyle.js ../node_modules/xr3-spoke/src/ui/GlobalStyle.js

#webpack
cp ../spoke/webpack.config.js ../node_modules/xr3-spoke/webpack.config.js

#.env?
cp ../spoke/.env.defaults ../node_modules/xr3-spoke/.env.prod

echo -e "\e[32mCompiling Spoke..."

# Compile spoke
cd ../node_modules/xr3-spoke && npm run build

echo -e "\e[32mMozilla Spoke is Ready!"
