/**
 * youtube-slack-bot
 */

const debug = require("debug")("youtube-slack-bot"),
      Slack = require("./lib/Slack"),
      slack = new Slack(process.env.MODUS_SLACK_SECRET),
      YouTube = require("./lib/YouTube");

const main = async () => {
    // slack.SendMessage('youtube-slack-bot', 'Slack class here');
    try {
	const yt = new YouTube();
	await yt.query();
	// slack.SendMessage('youtube-slack-bot', 'Slack class here');
	// const res = await web.chat.postMessage({ channel: conversationId, text: 'I am dangerous!' });
	// console.log("Message Sent: ", res.ts);
    }
    catch (e) {
	debug("error", e);
    }
};

main();

