#!/usr/bin/env bash
set -e

IMAGENAME=burrow-sysdig-shuttle
VERSION=latest

docker build -t "docker.groupbyinc.com/${IMAGENAME}:${VERSION}" .
docker tag -f "docker.groupbyinc.com/${IMAGENAME}:${VERSION}" "docker.groupbyinc.com/${IMAGENAME}:latest"
docker push "docker.groupbyinc.com/${IMAGENAME}"

set +e
echo "Ignore any errors below, just clearing dangling images"
docker rmi $(docker images -q -f dangling=true) || :
