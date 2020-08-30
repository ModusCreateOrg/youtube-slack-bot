/**
 *  subscriptions();
 *
 * Check channel statistics and print subscribers and views.
 *
 * Usage:
 *     await subscriptions();
 */

const debug = require("debug")("suscriptions"),
      yt = require('../lib/YouTube'),
      slack = require('../lib/Slack'),
      mongo = require('../lib/MongoDB');

const subscriptions = async () => {
  try {
    const KEY = "subscriptions";
    const statistics = await yt.queryChannelStatistics();

    const data = await mongo.Get(KEY);
    const last = data === null ? statistics : JSON.parse(data);
    statistics.viewCount = parseInt(statistics.viewCount, 10);
    statistics.commentCount = parseInt(statistics.commentCount, 10);
    statistics.subscriberCount = parseInt(statistics.subscriberCount, 10);
    statistics.videoCount = parseInt(statistics.videoCount, 10);
    await mongo.Set(KEY, JSON.stringify(statistics));

    last.viewCount = parseInt(last.viewCount, 10);
    last.commentCount = parseInt(last.commentCount, 10);
    last.subscriberCount = parseInt(last.subscriberCount, 10);
    last.videoCount = parseInt(last.videoCount, 10);

    const message = `Subscribers ${statistics.subscriberCount} (new: ${statistics.subscriberCount - last.subscriberCount}) ` +
	  `Views ${statistics.viewCount} (new: ${statistics.viewCount - last.viewCount})`;
    return message;
    // await slack.SendMessage('youtube-slack-bot', ` \`\`\`${message}\`\`\``);
  }
  catch (e) {
    await slack.Exception(e);
    // console.log("Exception", e.stack);
  }
};

module.exports = subscriptions;
