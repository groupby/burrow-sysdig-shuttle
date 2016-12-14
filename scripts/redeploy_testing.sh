#!/usr/bin/env bash
set -e
PACKAGE_VERSION=$(cat package.json | jq .version -r)
COMMIT_VERSION=$(git rev-parse HEAD | cut -c1-7)
NAME=$(cat package.json | jq .name -r)

/home/groupby/google-cloud-sdk/bin/gcloud config set project groupby-development
/home/groupby/google-cloud-sdk/bin/gcloud container clusters get-credentials wisdom-testing --zone us-central1-f
/home/groupby/google-cloud-sdk/bin/kubectl patch deployment ${NAME} -p "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"${NAME}\",\"image\":\"docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION}-${COMMIT_VERSION}\"}]}}}}" --namespace=default