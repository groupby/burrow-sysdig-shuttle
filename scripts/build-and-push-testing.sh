#!/usr/bin/env bash
set -e
PACKAGE_VERSION=$(cat package.json | jq .version -r)
COMMIT_VERSION=$(git rev-parse HEAD | cut -c1-7)
NAME=$(cat package.json | jq .name -r)

echo "Building and pushing ${NAME}:${PACKAGE_VERSION}-${COMMIT_VERSION}"

npm install --production --silent
docker build -t docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION}-${COMMIT_VERSION} .
docker push docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION}-${COMMIT_VERSION}