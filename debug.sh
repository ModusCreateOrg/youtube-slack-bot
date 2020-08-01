#!/bin/sh

# if you want to drop the database, you can use this command:
#   ./debug.sh DROP

DROP=$1 docker-compose -f docker-compose-dev.yml up
