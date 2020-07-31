#!/bin/sh

sudo rm -rf .config
docker-compose -f docker-compose-dev.yml build
docker-compose -f docker-compose-dev.yml run bot npm install
