apiName="${RELEASE_NAME}-xrengine-api"
clientName="${RELEASE_NAME}-xrengine-client"
gamesvrName="${RELEASE_NAME}-gameserver"

apiCount=$(kubectl get deploy $apiName -o jsonpath='{.status.availableReplicas}')
echo "API ready count: $apiCount"

# Wait until api count is 1.
until [ $apiCount -ge 1 ]
do
    sleep 5

    apiCount=$(kubectl get deploy $apiName -o jsonpath='{.status.availableReplicas}')
    echo "API ready count: $apiCount"
done

clientCount=$(kubectl get deploy $clientName -o jsonpath='{.status.availableReplicas}')
echo "Client ready count: $clientCount"

# Wait until client count is 1.
until [ $clientCount -ge 1 ]
do
    sleep 5

    clientCount=$(kubectl get deploy $clientName -o jsonpath='{.status.availableReplicas}')
    echo "Client ready count: $clientCount"
done

gamesvrCount=$(kubectl get fleet $gamesvrName -o jsonpath='{.status.readyReplicas}')
echo "Gameserver ready count: $gamesvrCount"

# Wait until gamesvr count is 1.
until [ $gamesvrCount -ge 1 ]
do
    sleep 5

    gamesvrCount=$(kubectl get fleet $gamesvrName -o jsonpath='{.status.readyReplicas}')
    echo "Gameserver ready count: $gamesvrCount"
done

echo "XREngine is now ready"
exit 0
