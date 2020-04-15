
if [ -z "$1" ]
  then
    echo "No argument supplied, You must supply the stage name."
    exit 1
fi

set -x

# ex -> beta-xrchat-realtime-server

STAGE=$1

kubectl delete cm/$STAGE-xrchat-server
kubectl create configmap $STAGE-xrchat-server --from-env-file=.env.server
kubectl get cm/$STAGE-xrchat-server -o yaml > $STAGE-xrchat-server-configmap.yaml