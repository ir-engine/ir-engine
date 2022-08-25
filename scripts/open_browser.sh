LOCAL_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | tail -n 1)
DST=https://${LOCAL_IP}:3000/$1
echo $DST
xdg-open $DST
