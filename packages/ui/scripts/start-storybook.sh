# !/bin/

source ../../.env.local

cross-env storybook dev -p 6006 -h $VITE_APP_HOST --ci --disable-telemetry --https --ssl-key $KEY --ssl-cert $CERT