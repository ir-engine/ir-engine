#!/bin/bash
# @important This script must be run from the root engine repository
set -eu
# @fileoverview
# - Creates a test-coverage report for each engine package
# - Unifies the outputs into a single folder
# - Merges them into one single html report

Prefix="scripts/test-coverage-unify.sh"
# @description Shorthand that echoes the given info message with a prefix added before it. Accepts varargs.
info () { echo "$Prefix: " "$@" ; }
# @description Shorthand that echoes the given warning message with a prefix added before it. Accepts varargs.
warn () { echo "[$Prefix : WARNING] " "$@" ; }


#_______________________________________
# @section Script Configuration
#_____________________________
rootDir=$(pwd)
reportDir="$rootDir/test-coverage"
coverageFile="$reportDir/coverage.json"
# @description Command that will be run inside each package folder to get its test-coverage data in json form
coverageCmd="npx nyc --reporter=json --report-dir=$reportDir mocha --jobs 1"
# @description Command that will be run at the end of the script, in order to generate the final html report
mergeCmd="npx istanbul-merge --out $coverageFile"
# @description
reportCmd="npx report --include $coverageFile --dir $reportDir html"

#_______________________________________
# @section Cleanup before
#_____________________________
if [[ -d $reportDir ]] ; then
  info "Output folder  $reportDir  already exists. Removing it..."
  rm -rf "$reportDir"
fi

#_______________________________________
# @section Folder list: Sanity check
#_____________________________
# @important This loop won't do anything unless a new folder is found at ROOT/packages/*.
# @description
#  Triggers an error when the script finds a new folder that doesn't know about.
#  It also tries to run the coverageCmd for that folder before exiting.
#  Used during development, and also for tracking newly added folders that are not explicitly mapped for test-coverage yet.
for dir in packages/*/; do
  cd "$dir"
  # TODO: Errors when running the coverageCmd inside the folder
  if [[ $dir = "packages/client/" ]]; then cd "$rootDir"; continue; fi;  # Errors
  if [[ $dir = "packages/instanceserver/" ]]; then cd "$rootDir"; continue; fi;  # Errors
  if [[ $dir = "packages/projects/" ]]; then cd "$rootDir"; continue; fi;  # Has no tests
  if [[ $dir = "packages/server-core/" ]]; then cd "$rootDir"; continue; fi;  # Errors
  if [[ $dir = "packages/server/" ]]; then cd "$rootDir"; continue; fi;  # Has no tests
  if [[ $dir = "packages/taskserver/" ]]; then cd "$rootDir"; continue; fi;  # Errors
  if [[ $dir = "packages/ui/" ]]; then cd "$rootDir"; continue; fi;  # Has no tests
  # OK:
  if [[ $dir = "packages/client-core/" ]]; then cd "$rootDir"; continue; fi;  # Has no tests
  if [[ $dir = "packages/common/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/ecs/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/editor/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/engine/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/hyperflux/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/matchmaking/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/network/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/spatial/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/visual-script/" ]]; then cd "$rootDir"; continue; fi;
  if [[ $dir = "packages/xrui/" ]]; then cd "$rootDir"; continue; fi;  # Has no tests
  info "SHOULD NOT HAPPEN:  Trying to get test-coverage data for an unmapped folder:  $dir"
  $coverageCmd
  cd "$rootDir"
  exit 1;
done


#_______________________________________
# @section Main Process
#_____________________________
# @description Explicit list of packages to include in test-coverage reports
packages=(
  "client-core"
  "common"
  "ecs"
  "editor"
  "engine"
  "hyperflux"
  "matchmaking"
  "network"
  "spatial"
  "visual-script"
  "xrui"
)

# @description
#  Runs the process for every folder listed in the explicit list of packages
#  1. Enters the package folder at  ROOT/packages/PACKAGENAME
#  2. Generates the coverage data in json form into the script's reportDir
#  3. Renames the file so that it is not overwritten by the process for the next folder
#  4. Adds the file's path to the list of files to merge at the end
#  5. Goes back to the root folder
for package in "${packages[@]}"; do
  dir="packages/$package"
  json="$reportDir/$package.json"
  info "Generating data for  $dir  @$json"

  cd "$dir"
  $coverageCmd
  mv "$reportDir/coverage-final.json" "$json"
  mergeCmd="$mergeCmd $json"
  cd "$rootDir"
done
cd "$rootDir"

# @description
#  Runs the process for merging all of the the resulting json coverage data files into a single html report
info "Merging the resulting reports into html  @$reportDir  with command:"
echo "  $mergeCmd"
$mergeCmd
info "Generating the resulting html report into  @$reportDir"
$reportCmd
