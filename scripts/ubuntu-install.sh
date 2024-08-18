#!/bin/bash
# @important Development Warning:
# - The primary target user of this script is a non-technical user that is running EE for their first time.
# - The script will fail at the first error to not confuse its user  `set -e`.
# - Activating `set -u` will break because sourcing the default ubuntu `~/.bashrc` file will immediately stop the script with an error.
# - This script must be run from an interactive shell with `bash -i`
#   @todo Solve not needing an interactive shell. Explanation of the problem:
#         The currently running shell won't understand that `nvm` was already sourced and it exists,
#         as it is sourced on the script-spawned shell by the nvm installer, but not in the shell that called the script.
#         The script will call for `nvm` in the caller shell, but it won't exist without first stopping the script.
#   @todo (tied to the above) The script needs to be downloaded and then run. It cannot be piped to `wget` or `curl` as a oneliner.
#         The script requires an interactive shell, and piping with an interactive shell lead to very unexpected results during QA testing.
set -e

# @fileoverview
# Easy EE Installer for localdev on Ubuntu.
# Manages installation of all of EE's dependencies for the first time.
# @note Only for local. Not meant to be a replacement for proper advanced instructions. The goal is to kickstart/onboard users easier.
#
# @description
# - Automatically adds `universe` and `docker's APT` repositories to the system (required by docker-desktop)
# - Automatically installs git, curl, nvm, nodeLTS, ca-certificates
# - Guides the user on how to download the latest docker-desktop .deb file.
#   Continues installing docker-desktop after the user has downloaded the file and presses enter.
# - Clones EE's main repository (@important does NOT use --depth=1)
# - Installs all npm dependencies for the engine
#
# @howto The script can be run with this oneliner command:
#        wget https://github.com/path/to/this/file.sh && bash -i file.sh

Prefix="EE"
# @description Shorthand that echoes the given info message with a prefix added before it. Accepts varargs.
info () { echo "$Prefix: " $@ ; }
# @description Shorthand that echoes the given warning message with a prefix added before it. Accepts varargs.
warn () { echo "[$Prefix : WARNING] " $@ ; }

# Crash on non-Ubuntu distributions
if [[ $(lsb_release -si) -ne "Ubuntu" ]] ; then
  warn "This script only works for Ubuntu Linux distributions."
  read -r -n1 -p 'Are you sure you want to continue? [y/n] ' choice
  case "$choice" in
    y|Y) warn "Running Infinite Reality Engine Ubuntu installer script on:"; echo "  $(lsb_release -sa)";;
    n|N|*) exit 1;;
  esac
fi

echo ""
info "This script is going to:"
echo "1. Add/activate the universe and docker APT repositories to the system (required for docker-desktop)"
echo "2. Install git, curl, nvm, ca-certificates and nodeLTS"
echo "3. Instruct you on how to download docker-desktop"
echo "4. Install docker-desktop with the file you downloaded while the script waited for your input"
echo "5. Clone Infinite Reality Engine's repository to the folder $(pwd)/ir-engine"
echo "6. Install all npm dependencies that Infinite Reality Engine needs"
echo ""
read -r -n1 -p 'Do you want to continue? [y/n] ' choice
case "$choice" in
  y|Y) info "Running Infinite Reality Engine's Ubuntu installer" ;;
  n|N|*) exit 1 ;;
esac


# Install requirements automatically without user prompt
info "Installing requirements..."
sudo add-apt-repository universe -y # Add universe to the repositories list
sudo apt-get update -y # Update the package list
sudo apt-get install -y ca-certificates curl git
# Check installed requirements:
info "Checking git version"
git --version
info "Checking curl version"
curl --version

# Install nvm:  https://github.com/nvm-sh/nvm#installing-and-updating
info "Installing nvm..."
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source $HOME/.bashrc  # This line is what requires this script to be run from an interactive shell
nvm --version         # This line will crash if the script is not run with `bash -i`

# Install NodeLTS
info "Installing node..."
nvm install --lts
info "Checking npm version"
npm --version
info "Checking node version"
node --version

# Install Docker (https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
## Clean conflicting packages  @todo: Make it not crash on missing packages
#for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
## Add Docker's official GPG key:
info "Installing Docker's Official APT repository..."
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
## Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update -y
## Install docker-desktop
info "Installing Docker Desktop..."
echo ""
echo "::: IMPORTANT :::"
echo "Open https://docs.docker.com/desktop/install/ubuntu/#install-docker-desktop and click on 'Download latest DEB package'."  
echo "Make sure you download the '.deb' file into the current folder before continuing.   (firefox will download the file to $HOME/Downloads)"
echo "The current folder is:  $(pwd)"
echo ""
IFS=
while true
do
  read -r -n1 -p 'Press enter when you are ready to continue. ' choice
  case "$choice" in
    "") echo ""; break;;
    *) echo ""; continue;;
  esac
done
dockerFile=$(find -type f -path "./docker-desktop-*.deb")
info "Installing docker-desktop from file:  $dockerFile"
sudo apt install $dockerFile
info "Launching docker-desktop"
systemctl --user start docker-desktop

# Install the engine
info "Installing Infinite Reality Engine into folder $(pwd)/ir-engine ..."
git clone https://github.com/ir-engine/ir-engine
info "Changing folder to $(pwd)/ir-engine"
cd ir-engine
info "Creating a new .env file at $(pwd)/.env.local"
cp .env.local.default .env.local
info "Running the command 'npm install' inside the folder $(pwd)"
npm install
echo ""
info "Infinite Reality Engine has been successfully installed into $(pwd)."
echo "   You can now run it by executing the command:"
echo "   npm run reinit && npm run dev"

