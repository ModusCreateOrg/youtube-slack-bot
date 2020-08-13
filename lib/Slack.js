// TODO: keep track of joined channels?

const debug = require("debug")("Slack"),
      {WebClient} = require("@slack/web-api");

// set this to true to have the messages printed to stdout instead of to slack channel
// const DEBUGME = true;
const DEBUGME = false;

class Slack {
  constructor(token) {
    this.token = token || process.env.MODUS_SLACK_SECRET;
    this.channel = 'youtube-slack-bot';
  }

  async SendBlocks(channel, blocks) {
    try {
      const web = new WebClient(this.token);
      const res = await web.chat.postMessage({ channel: channel, text: 'text', blocks: blocks.blocks});
      debug("Message Sent: ", res.ts);
    }
    catch (e) {
      debug("Slack error", e);
      throw e;
    }
  }
  async SendMessage(channel, text, blocks) {
    if (DEBUGME) {
      console.log(`DEBUGME SendMessage(${channel}, ${text})`);
      return;
    }

    // We're creating a new WebClient each message.
    // This allows us to not have some long held connection open
    try {
      const web = new WebClient(this.token);
      const res = await web.chat.postMessage({ channel: channel, text: text, blocks: blocks });
      debug("Message Sent: ", res.ts);
    }
    catch (e) {
      debug("Slack error", e);
      throw e;
    }
  }

  async Exception(e) {
    try {
      const msg = `\`\`\`BOT Exception ${e.stack}\`\`\``;
      await this.SendMessage(this.channel, msg);
    }
    catch (e) {
      console.log("Slack.Exception", e);
    }
  }
};

module.exports = new Slack(process.env.MODUS_SLACK_SECRET);
