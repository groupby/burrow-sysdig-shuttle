#!/usr/bin/env bash
set -e
PACKAGE_VERSION=$(cat package.json | jq .version -r)
NAME=$(cat package.json | jq .name -r)

echo "Building and pushing ${NAME}:${PACKAGE_VERSION}"

npm install --production --silent
docker build -t docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION} .
docker push docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION}