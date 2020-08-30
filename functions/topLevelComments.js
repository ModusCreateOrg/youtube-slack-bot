/**
 *  topLevelComments();
 *
 * Check videos for comments not replied to after 48 hours.
 *
 * Usage:
 *     await topLevelComments();
 */

const debug = require('debug')("topLevelComments"),
      yt = require('../lib/YouTube'),
      slack = require('../lib/Slack'),
      mongo = require('../lib/MongoDB');

const topLevelComments = async (videos, comments) => {
  let number = 0;
  try {
    for (let item of comments) {
      const snippet = item.snippet,
	    key = item.snippet.videoId,
	    comment = item.snippet,
	    video = videos[key];

      if (!video) {
	continue;
      }
      video.comments = video.comments || [];
      video.comments.push(comment);
    }

    const sorted = [];
    for (let key of Object.keys(videos)) {
      if (key == 'count') {
	continue;
      }

      const video = videos[key],
	    snippet = video.snippet;

      video.comments = video.comments || [];

      video.comments = video.comments.sort((c1, c2) => {
	const snip1= c1.topLevelComment.snippet,
	      snip2 = c2.topLevelComment.snippet;
	const d1 = new Date(snip1.publishedAt),
	      d2 = new Date(snip2.publishedAt);
	return d2 - d1;
      });

      const now = new Date();
      for (let comment of video.comments) {
	const csnippet = comment.topLevelComment.snippet,
	      replyCount = comment.totalReplyCount,
	      id = comment.topLevelComment.id,
	      d1 = new Date(csnippet.publishedAt),
	      elapsed = Math.round((now - d1)  / (1000 * 60 * 60 * 24));

	if (elapsed >= 2 && replyCount == 0) {
	  const dbKey = `state-${id}`,
	  	raw = await mongo.Get(dbKey) || "{}",
		record = JSON.parse(raw);

	  if (record.processedTopLevelComments) {
	    debug(`topLevelComments - skipping ${snippet.title} - already processed`);
	    record.processedTopLevelComments = Date.now();
	    await mongo.Set(dbKey, JSON.stringify(record));
	  }
	  else  {
	    // comment has not been processed
	    record.processedTopLevelComments = Date.now();
	    await mongo.Set(dbKey, JSON.stringify(record));
	    sorted.push({
	      id: id,
	      replyCount: replyCount,
	      video: csnippet,
	      elapsed: elapsed,
	      date: d1,
	      text: `  \`\`\`Comment on video ${snippet.title} has not been replied to for ${elapsed}  days.\`\`\``});
	  }
	}
      }
    }
    sorted.sort((a, b) => {
      return a.date - b.date;
    });

    for (let comment of sorted) {
      await slack.SendMessage(slack.channel, comment.text);
      number++;
    }
    return `Number of comments not replied to ${number}`;
  }
  catch (e) {
    slack.Exception(e);
  }
};

module.exports = topLevelComments;
