#!/usr/bin/env bash
docker rm -f es
docker rm -f redis
docker rm -f rabbitmq
docker pull elasticsearch:2.3
docker pull redis:3.0
docker pull rabbitmq:3.6-management
docker run -d --name es -p 9200:9200 elasticsearch:2.3 -Des.script.indexed=true -Des.action.auto_create_index=false
docker run -d --name redis -p 6379:6379 redis:3.0
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3.6-management