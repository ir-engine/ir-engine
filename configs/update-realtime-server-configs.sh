
if [ -z "$1" ]
  then
    echo "No argument supplied, You must supply the stage name."
    exit 1
fi

set -x
STAGE=$1

# ex -> beta-xrchat-realtime-server

kubectl delete cm/$STAGE-xrchat-realtime-server
kubectl create configmap $STAGE-xrchat-realtime-server --from-env-file=.env.realtime-server
kubectl get cm/$STAGE-xrchat-realtime-server -o yaml > $STAGE-xrchat-realtime-server-configmap.yaml