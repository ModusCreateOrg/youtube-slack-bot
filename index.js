/**
 * youtube-slack-bot
 */

// process.env.DEBUG='topLevelComments newComments';
process.env.DEBUG='YouTube subscriptions';


const debug = require("debug")("youtube-slack-bot"),
      slack = require("./lib/Slack"),
      yt = require("./lib/YouTube"),
      MongoDB = require("./lib/MongoDB");

const topLevelComments = require('./functions/topLevelComments'),
      newComments = require('./functions/newComments'),
      subscriptions = require('./functions/subscriptions');

const wait = ms => new Promise(res => setTimeout(res, ms));

const HOUR = 60 * 60 * 1000,
      DAY = 24 * HOUR;

const main = async () => {
  await slack.SendMessage('youtube-slack-bot', "  ");
  await slack.SendMessage('youtube-slack-bot', "  ");
  await slack.SendMessage('youtube-slack-bot', `youtube-slack-bot started (${process.env.NODE_ENV})`);

  for (;;) {
    for (let hour = 0; hour<24; hour++) {
      try {
	// fetch videos and comments - order of these calls is important!
	const videos = await yt.queryChannel(),
	      comments = await yt.queryComments();

	// do these things every hour:
	await topLevelComments(videos, comments);
	await newComments(videos);
	await subscriptions();

	await wait(HOUR);
	await ty.resetDatabase();
      }
      catch (e) {
	console.log("YOUTUBE BOT ", e);
      }
    }
  }
};

const drop = async () => {
  try {
    const result = await MongoDB.DropDatabase();
    console.log(result);
  }
  catch (e) {
    debug("drop error", e);
  }
};

const foo = async() => {
  if (false) {
    const ids = [];
    for (let key of Object.keys(videos)) {
      if (key != 'count') {
	console.log("key", key, "title", videos[key].snippet.title);
	ids.push(key);
      }
    }
    const data = await yt.queryVideos(ids);
  }
};

if (process.env.DROP) {
  console.log("Dropping database");
  drop();
  process.exit(1);
}
else {
  main();
}

