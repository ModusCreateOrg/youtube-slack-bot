# YouTube Slack Bot

A bot that connects to YouTube API and sends notices to Slack channel(s)

## Developing

This project uses Docker containers and docker-compose, so you only need Docker installed on your system.

Development is done in the containers, via a bind/mount of the repo working set on your workstation to the application directory in the container.

1) Building the containers:
   ```docker-compose -f docker-compose-dev.yml build```
2) ./debug.sh to debug (after built the containers)
3) Edit and save without stopping the containers.  nodemon detects file changes and restarts the bot.
4) Rebuild (build-dev.sh) might be necessary if you add new code files to the project

## Environment variables
Two environment variables are required:
  * ```export MODUS_SLACK_SECRET=<the slack secret>```
  * ```export MODUS_YOUTUBE_SECRET=<the youtube secret>```
  
* I set these in my .zshrc.local, which is NEVER pushed to any repository.  

DO NOT COMMIT SECRETS (values) TO THE REPOSITORY!

## Notes
* You do not need node_modules on the host, but if you do npm install --save, it will be created.  You can rm -rf it safely.
* In theory, this can run on a Raspberry Pi.  You do need to install Docker on it, of course.
* On the Pi, you'd set the environment variables in .bashrc, and NEVER commit .bashrc to any repository!
* The YouTube class uses MongoDB to cache the queries we need.  If you stop/start the program, it will use the cache.
* If you leave the program running, the cached queries will be removed every hour, forcing updated queries to YouTube API.
* MongoDB is also used to keep track of videos and comments that have been processed.  This helps us avoid sending the same notifications over and over, each time the program is restarted.
* Plain old es6, and require.  No transpiling.
* Make sure to use try/catch everywhere, so the appliation doesn't crash on unexpected API calls, etc.

## BEWARE
There is a quota/limit to the number of queries that can be done against the YouTube API.  I'm pretty sure that doing our queries hourly won't exceed the quota.

Because of the quota, you should be VERY conservative about doing queries in loops, until you have made your code bullet-proof.
