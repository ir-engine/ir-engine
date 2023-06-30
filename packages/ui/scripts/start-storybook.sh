# !/bin/

source ../../.env.local

storybook dev -p 6006 -h $VITE_APP_HOST --disable-telemetry --https --ssl-key ../../certs/key.pem --ssl-cert ../../certs/cert.pem