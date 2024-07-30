#!/bin/bash
# @important This script must be run from the root engine repository
set -eu
# @fileoverview
#  - Runs the test-coverage html results with a local-dev http server

Prefix="scripts/test-coverage-launch.sh"
# @description Shorthand that echoes the given info message with a prefix added before it. Accepts varargs.
info () { echo "[$Prefix]: " "$@" ; }
# @description Shorthand that echoes the given warning message with a prefix added before it. Accepts varargs.
warn () { echo "[$Prefix : WARNING] " "$@" ; }


#_______________________________________
# @section Script Configuration
#_____________________________
rootDir=$(pwd)
# @description Folder where the results of this script will be output
reportDir="$rootDir/coverage"
# @description http server package to install 
server="http-server"
# @description Command to install the http server package locally without saving it
serverInstallCmd="npm install $server --no-save"
# @description Command to run the report with the http server after the coverage data has been generated
serverRunCmd="npx $server $reportDir -o"
# @description Command to check if the http server package has been installed
installed=1
if npm list $server; then installed=0; else installed=1; fi


#_______________________________________
# @section Main Process
#_____________________________
# @description
#  Launches the generated html website using a local-only install of http-server
#  https://www.npmjs.com/package/http-server
# @note
#  Does not install http-server as a dependency
#  Does not reinstall http-server if it already exists
if [[ $installed -eq 0 ]]; then
  info "$server already exists. Skipping installation."
else
  info "$server does not exist. Installing it with:"
  echo "  $serverInstallCmd"
  $serverInstallCmd
fi
#_____________________________
info "Running $server with the test-coverage results generated at:  $reportDir"
echo "  $serverRunCmd"
rm "$reportDir/coverage-final.json" # Remove the raw json to unconfuse http-server
$serverRunCmd
