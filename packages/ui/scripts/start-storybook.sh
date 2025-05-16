# !/bin/


. ../../.env.local

SSL_KEY="../../$KEY"
SSL_CERT="../../$CERT"

cross-env storybook dev -p 6006 -h $VITE_APP_HOST --ci --disable-telemetry --https --ssl-key $SSL_KEY --ssl-cert $SSL_CERT