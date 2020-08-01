const debug = require("debug")("newComments"),
      yt = require('../lib/YouTube'),
      slack = require('../lib/Slack'),
      mongo = require('../lib/MongoDB');

const ONE_HOUR = 1000 * 60 * 60;

const newComments = async (videos) => {
  let number = 0;
  const newComments = [],
	now = new Date(),
	keys = Object.keys(videos);

  // for (let i = 0; i < keys.length; i++ ) {
  // const key = keys[i];
  for (let key of keys) {
    if (key == 'count') {
      continue;
    }
    const video = videos[key],
	  snippet = video.snippet,
	  id = video.snippet.videoId,
	  comment = video.snippet;

    const  videoComments = video.comments.sort((c1, c2) => {
      const snip1= c1.topLevelComment.snippet,
      	    snip2 = c2.topLevelComment.snippet;
      const d1 = new Date(snip1.publishedAt),
      	    d2 = new Date(snip2.publishedAt);
      return d1 - d2;
    });

    for (let comment of videoComments) {
      const topLevelComment = comment.topLevelComment,
	    snippet = topLevelComment.snippet,
	    video = videos[snippet.videoId],
	    title = video.snippet.title,
	    id = comment.topLevelComment.id;


      const d = new Date(snippet.publishedAt),
	    diff = now - d;

      const dbKey = `state-${id}`,
	    raw = await mongo.Get(dbKey) || "{}",
	    record = JSON.parse(raw);

      if (record.newCommentProcessed) {
	debug(`newComments - already processed ${snippet.authorDisplayName} ${title}`);
      }
      else {
	if (diff < ONE_HOUR*2) {
	  debug(`newComment! - ${d.toString} ${snippet.authorDisplayName} ${title}`);
	  await slack.SendMessage(`youtube-slack-bot', "new comment on video ${title}`);
	  number++;
	}
	else {
	  debug(`newComments - skipping  ${d.toString()} ${snippet.authorDisplayName} ${title}`);
	}
      }
      record.newCommentProcessed = Date.now();
      await mongo.Set(dbKey, JSON.stringify(record));
    }
  }

    await slack.SendMessage('youtube-slack-bot', `  \`\`\`Number of new comments ${number}\`\`\``);
};

module.exports = newComments;
