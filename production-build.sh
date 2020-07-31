#!/bin/sh

sudo rm -rf .config
docker-compose -f docker-compose.yml build
docker-compose run bot yarn install
