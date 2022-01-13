set -e
set -x

STAGE=$1
TAG=$2

# The expected tag should start with this. So adding * at end for starts with.
expectedTag="$TAG*"
echo "Expected tag: $expectedTag"

jobName="${STAGE}-xrengine-testbot"

# Get the current image tag of testbot job.
imageName=$(kubectl get job $jobName -o=jsonpath='{$.spec.template.spec.containers[:1].image}')
tag=$(echo $imageName | cut -d ":" -f2)
echo "Current tag: $tag"

# Wait until correct image tag is used.
until [[ $tag = $expectedTag ]]
do
    sleep 15

    imageName=$(kubectl get job $jobName -o=jsonpath='{$.spec.template.spec.containers[:1].image}')
    tag=$(echo $imageName | cut -d ":" -f2)
    echo "Current tag: $tag"
done

# Wait just to ensure everything is ready.
sleep 10

# Get name of pod from job
podName=$(kubectl get pods --selector=job-name=$jobName --output=jsonpath='{.items[*].metadata.name}')
echo "Pod Name: $podName"

# Get the current status of testbot pod.
podStatus=$(kubectl get pods $podName --no-headers -o custom-columns=":status.phase")
echo "Pod status: $podStatus"

# Wait until correct status of testbot.
until [[ $podStatus == "Succeeded" || $podStatus == "Failed" ]]
do
    sleep 15

    podStatus=$(kubectl get pods $podName --no-headers -o custom-columns=":status.phase")
    echo "Pod status: $podStatus"
done

# Exit script based on if test pod ran successfully or not.
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