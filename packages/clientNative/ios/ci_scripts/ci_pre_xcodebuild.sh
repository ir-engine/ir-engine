#!/bin/sh

cd ../..
ls

cp ../../.env.remote.default ../../.env.local

echo "===== Installling Gems ====="
echo 'export GEM_HOME=$HOME/gems' >> ~/.zshrc
echo 'export PATH=$HOME/gems/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

export GEM_HOME=$HOME/gems
export PATH="$GEM_HOME/bin:$PATH"

echo ">>> INSTALL BUNDLER"
gem install bundler:2.4.10 --install-dir $GEM_HOME
bundle --version
bundle install

echo "===== Installing Node.js ====="
brew install node@20
echo 'export PATH="/usr/local/opt/node@20/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
node -v
npm -v

# Install dependencies
echo "===== Install JavaScript Dependencies ====="
cd ../..
npm install -g patch-package
npm install
echo "===== Install Native Dependencies ====="
cd packages/clientNative
npm install
bundle exec pod install --project-directory=ios
