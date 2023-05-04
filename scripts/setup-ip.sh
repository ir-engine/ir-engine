LOCAL_IP=$(ip addr show tailscale0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}')
cp .env.local.default .env.local
sed -i "s/localhost/${LOCAL_IP}/g" .env.local
