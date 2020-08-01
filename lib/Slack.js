// TODO: keep track of joined channels?

const debug = require("debug")("Slack"),
      {WebClient} = require("@slack/web-api");

class Slack {
    constructor(token) {
	this.token = token || process.env.MODUS_SLACK_SECRET;
    }

    async SendMessage(channel, text) {
	// We're creating a new WebClient each message.
	// This allows us to not have some long held connection open
	try {
	    const web = new WebClient(this.token);
	    const res = await web.chat.postMessage({ channel: channel, text: text });
	    debug("Message Sent: ", res.ts);
	}
	catch (e) {
	    debug("Slack error", e);
	    throw e;
	}
    }
};

module.exports = new Slack(process.env.MODUS_SLACK_SECRET);
