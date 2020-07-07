/**
 * youtube-slack-bot
 */

const {WebClient} = require("@slack/web-api");

const token = process.env.MODUS_SLACK_SECRET;

console.log("token: ", token);

const web = new WebClient(token);

const conversationId = 'youtube-slack-bot'

const main = async () => {
    try {
	const res = await web.chat.postMessage({ channel: conversationId, text: 'I am dangerous!' });
	console.log("Message Sent: ", res.ts);
    }
    catch (e) {
	console.log("error", e);
    }
};

main();

