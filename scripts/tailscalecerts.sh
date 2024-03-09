#!/usr/bin/env bash
if (( $EUID != 0 )); then
    echo "Please run as root"
    exit
fi
if (( "${PWD##*/}" != "etherealengine")); then
    echo "Please run in /etherealengine"
    exit
fi
instructions () {
  printf "Open ${GREEN}/etherealengine/.env.local${NC}\n"
  printf "Change all '${RED}localhost${NC}' to '${BLUE}$domain${NC}'\n"
  printf "Change '${RED}CERT=certs/cert.pem${NC}' to '${BLUE}CERT=certs/tailscale/cert.pem${NC}'\n"
  printf "Change '${RED}KEY=certs/key.pem${NC}' to '${BLUE}CERT=certs/tailscale/key.pem${NC}'\n"
}

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
# Colors end

case "$(uname -s)" in
   Darwin)
    if ! command -v /Applications/Tailscale.app/Contents/MacOS/Tailscale &> /dev/null
    then
        echo "tailscale could not be found"
        echo "Install tailscale cli on your respective distro and login"
        exit 1
    fi
    domain=$(/Applications/Tailscale.app/Contents/MacOS/Tailscale cert 2>&1 | grep -o '".*"' | sed 's/"//g')
    tailscale cert $domain 2>&1>/dev/null
    cp ~/Library/Containers/io.tailscale.ipn.macos/Data/$domain.crt certs/tailscale/cert.pem
    cp ~/Library/Containers/io.tailscale.ipn.macos/Data/$domain.key certs/tailscale/key.pem
    instructions
     ;;
   Linux)
    if ! command -v tailscale &> /dev/null
    then
        echo "tailscale could not be found"
        echo "Install tailscale cli on your respective distro and login"
        exit 1
    fi
    domain=$(tailscale cert 2>&1 | grep -o '".*"' | sed 's/"//g')
    tailscale cert --cert-file certs/tailscale/cert.pem --key-file certs/tailscale/key.pem $domain 2>&1>/dev/null
    chmod 644 ./certs/cert.pem
    chmod 644 ./certs/key.pem
    instructions
     ;;
   CYGWIN*|MINGW32*|MSYS*|MINGW*)
     echo 'MS Windows'
     echo "Tailscale Cert generation not currently supported on windows"
     ;;
   *)
    echo 'Not supported.'
    echo 'Other OS' 
     ;;
esac