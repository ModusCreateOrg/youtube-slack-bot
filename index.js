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
      subscriptions = require('./functions/subscriptions'),
      mostViewed = require('./functions/mostViewed');


const SECOND = 1000,
      MINUTE = 60 * SECOND,
      HOUR = 60 * MINUTE,
      DAY = 24 * HOUR;

const wait = ms => new Promise(res => setTimeout(res, ms));

// wait until 8AM
const tomorrow = async () => {
  const today = new Date();
  for (;;) {
    const d = new Date();
    if (d.getDate() != today.getDate()) {
      break;
    }
    await wait(HOUR);
  }
  for (;;) {
    const d = new Date();
    if (d.getSeconds() == 0) {
      break;
    }
    await wait(SECOND);
  }
  for (;;) {
    const d = new Date();
    if (d.getHours() == 8) {
      return;
    }
    await wait(MINUTE);
  }
};

const main = async () => {
  await slack.SendMessage(slack.channel, "  ");
  await slack.SendMessage(slack.channel, "  ");
  await slack.SendMessage(slack.channel, `youtube-slack-bot started (${process.env.NODE_ENV})`);

  for (;;) {
    try {
      // fetch videos and comments - order of these calls is important!
      const videos = await yt.queryChannelVideos(),
	    comments = await yt.queryComments();

      // do these things every day at 8AM EST:
      const d = new Date();
      const output = ['```',
		      "",
		      "Daily Report for " + d.toDateString() + " " + d.toLocaleTimeString(),
		      "-------------------------------------------",
		      ""];
      output.push(await subscriptions());
      output.push(await topLevelComments(videos, comments));
      output.push(await newComments(videos));
      output.push(await mostViewed(videos));
      output.push('```');

      slack.SendMessage(slack.channel, output.join('\n'));
      await tomorrow();
      await yt.resetDatabase();
    }
    catch (e) {
      console.log("YOUTUBE BOT ", e);
    }
  }
};

/**
 * If DROP env var is set, this is called to completely drop the MongoDB database.
 */
const drop = async () => {
  try {
    const result = await MongoDB.DropDatabase();
    console.log(result);
  }
  catch (e) {
    debug("drop error", e);
  }
};

if (process.env.DROP) {
  console.log("Dropping database");
  drop();
  console.log("Dropped database");
  process.exit(1);
}
else {
  main();
}

