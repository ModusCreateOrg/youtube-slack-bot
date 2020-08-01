# YouTube Slack Bot

A bot that connects to YouTube API and sends notices to Slack channel(s)

## Developing

This project uses Docker containers and docker-compose, so you only need Docker installed on your system.

1) Building the containers:
   docker-compose -f docker-compose-dev.yml build
2) ./debug.sh to debug (after built the containers)
3) edit and save without stopping the containers.  nodemon detects file changes and restarts the bot.

## Note:
* two environment variables are required:
  1. MODUS_SLACK_SECRET
  2. MODUS_YOUTUBE_SECRET
  
* I set these in my .zshrc.local, which is NEVER pushed to any repository.  

DO NOT COMMIT SECRETS (values) TO THE REPOSITORY!


   
