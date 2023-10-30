#!/usr/bin/env bash
if ! command -v -- "mkcert" > /dev/null 2>&1; then
  echo "ERROR: mkcert not installed."
  exit 1
fi
DIR=`pwd`/../newcerts
set -a; source ../.env.local; set +a
case "$(uname -s)" in
   Darwin)
    rm -rf $DIR
    mkdir -p $DIR
    mkcert -install
    mkcert -cert-file $DIR/server-cert.pem -key-file $DIR/server-key.pem $VITE_APP_HOST 
     ;;
   Linux)
    rm -rf $DIR
    mkdir -p $DIR
    mkcert -install
    mkcert -cert-file $DIR/server-cert.pem -key-file $DIR/server-key.pem $VITE_APP_HOST local1.etherealengine.com local2.etherealengine.cm
     ;;
   CYGWIN*|MINGW32*|MSYS*|MINGW*)
     echo 'MS Windows'
     echo "Automatic cert generation for SSL isn't supported on Windows, please add this code"
     ;;
   *)
    echo 'Not supported.'
    echo 'Other OS' 
     ;;
esac