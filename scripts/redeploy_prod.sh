#!/usr/bin/env bash
set -e
PACKAGE_VERSION=$(cat package.json | jq .version -r)
NAME=$(cat package.json | jq .name -r)

/home/groupby/google-cloud-sdk/bin/gcloud config set project groupby-cloud-1701
/home/groupby/google-cloud-sdk/bin/gcloud container clusters get-credentials wisdom-prod-3 --zone us-central1-f
/home/groupby/google-cloud-sdk/bin/kubectl patch deployment ${NAME} -p "{\"spec\":{\"template\":{\"spec\":{\"containers\":[{\"name\":\"${NAME}\",\"image\":\"docker.groupbyinc.com/${NAME}:${PACKAGE_VERSION}\"}]}}}}" --namespace=wisdom-shared-us