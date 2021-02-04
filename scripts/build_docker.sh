#!/bin/bash
set -e
set -x

LABEL=$1

docker build --tag $LABEL .