# set -e
# set -x

# STAGE=$1
# TAG=$2

podName="local-xrengine-test-bot"

# The expected tag should start with this. So adding * at end for starts with.
expectedTag="lat"
expectedTag="$expectedTag*"
echo "Expected tag: $expectedTag"

# Get the current image tag of test-bot pod.
imageName=$(kubectl get pods $podName --no-headers -o custom-columns="IMAGE:.spec.containers[*].image")
tag=$(echo $imageName | cut -d ":" -f2)
echo "Current tag: $tag"

# Wait until correct image tag is used.
until [[ $tag = $expectedTag ]]
do
    sleep 5

    imageName=$(kubectl get pods $podName --no-headers -o custom-columns="IMAGE:.spec.containers[*].image")
    tag=$(echo $imageName | cut -d ":" -f2)
    echo "Current tag: $tag"
done

# Get the current status of test-bot pod.
podStatus=$(kubectl get pods $podName --no-headers -o custom-columns=":status.phase")
echo "Pod status: $podStatus"

# Wait until correct status of test-bot.
until [[ $podStatus == "Succeeded" || $podStatus == "Failed" ]]
do
    sleep 5

    podStatus=$(kubectl get pods $podName --no-headers -o custom-columns=":status.phase")
    echo "Pod status: $podStatus"
done

# Exit script based on if pod ran successfully or not.
if [ $podStatus == "Succeeded" ]
then
    echo "Test bot ran successfully"
    exit 0
else
    podLogs=$(kubectl logs $podName)
    echo "Pod logs: $podLogs"

    echo "Test bot failed"
    exit 1
fi