#!/bin/bash

# List all Docker container IDs
container_ids=$(docker ps -aq)

# Check if there are any containers to delete
if [ -z "$container_ids" ]; then
    echo "No Docker containers found."
else
    # Delete each container by ID
    for container_id in $container_ids; do
        docker rm -f "$container_id"
        echo "Deleted container: $container_id"
    done
    echo "All Docker containers have been deleted."
fi
