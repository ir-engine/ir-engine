apiName="${RELEASE_NAME}-xrengine-api"
clientName="${RELEASE_NAME}-xrengine-client"
instanceserverName="${RELEASE_NAME}-instanceserver"

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

instanceserverCount=$(kubectl get fleet $instanceserverName -o jsonpath='{.status.readyReplicas}')
echo "Instanceserver ready count: $instanceserverCount"

# Wait until instanceserver count is 1.
until [ $instanceserverCount -ge 1 ]
do
    sleep 5

    instanceserverCount=$(kubectl get fleet $instanceserverName -o jsonpath='{.status.readyReplicas}')
    echo "Instanceserver ready count: $instanceserverCount"
done

echo "XREngine is now ready"
exit 0
