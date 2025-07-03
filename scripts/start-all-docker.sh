#!/usr/bin/env bash

docker start ir-engine_db
docker start ir-engine_redis
docker start ir-engine_minikube_db
docker start ir-engine_test_db
docker start ir-engine_vector_db
docker start ir-engine_vector_test_db