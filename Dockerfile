# Dockerfile for Modus Create's YouTube/Slack bot

FROM node

# Modus is in VA, so we'll use East Coast time.
ENV TZ=America/New_York

# Update and install software
RUN apt-get update -qq >/dev/null && apt-get install -y -qq curl procps telnet >/dev/null

# add a user named bot and create home directory for it
Run useradd --user-group --create-home --shell /bin/false bot

# Setup and copy our files to the container /home/bot
ENV HOME=/home/bot
WORKDIR /home/bot
COPY . /home/bot

# install node_modules
#RUN yarn install

CMD ["yarn", "start" ]
