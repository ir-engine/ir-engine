#!/bin/bash -i
# @important Development Warning:
# - The primary target user of this script is a non-technical user that is running EE for their first time.
# - The script will fail at the first error to not confuse its user  `set -e`.
# - This script must be run from an interactive shell with `bash -i`
# - Activating `set -u` will break because sourcing the default ubuntu `~/.bashrc` file will stop the script.
set -e

# @fileoverview
# Easy EE Installer for localdev on Ubuntu.
# Manages installation of all of EE's dependencies for the first time.
# @note Only for local. Not meant to be a replacement for proper advanced instructions. The goal is to kickstart/onboard users easier.
#
# @description
# - Automatically adds `universe` and `docker's APT` repositories to the system (required by docker-desktop)
# - Automatically installs git, curl, nvm, node18, ca-certificates
# - Guides the user on how to download the latest docker-desktop .deb file.
#   Continues installing docker-desktop after the user has downloaded the file and presses enter.
# - Clones EE's main repository (@important does NOT use --depth=1)
# - Installs all npm dependencies for the engine

# Crash on non-Ubuntu distributions
if [[ $(lsb_release -si) -ne "Ubuntu" ]] ; then
  echo "[ERROR] This script only works for Ubuntu Linux distributions."
  exit 1
fi

# Add universe to the repositories list and update the package list
sudo add-apt-repository universe
sudo apt-get update

# Install git:
sudo apt install git
git --version

# Install nvm:  https://github.com/nvm-sh/nvm#installing-and-updating
wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source $HOME/.bashrc  # This line is what requires this script to be run from an interactive shell
nvm --version         # This line will crash if the script is not run with `bash -i`

# Install Node18
nvm install 18
npm --version
node --version

# Install Docker (https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)
## Clean conflicting packages  @todo: Make it not crash on missing packages
#for pkg in docker.io docker-doc docker-compose docker-compose-v2 podman-docker containerd runc; do sudo apt-get remove $pkg; done
## Add Docker's official GPG key:
sudo apt-get install ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
## Add the repository to Apt sources:
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
## Install docker-desktop
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
sudo apt install $(find -type f -path "./docker-desktop-*.deb")
systemctl --user start docker-desktop

# Install the engine
git clone https://github.com/EtherealEngine/etherealengine
cd etherealengine
cp .env.local.default .env.local
npm install
