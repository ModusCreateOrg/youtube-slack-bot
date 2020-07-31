/**
 * youtube-slack-bot
 */

process.env.DEBUG='MongoDB';


const debug = require("debug")("youtube-slack-bot"),
      Slack = require("./lib/Slack"),
      slack = new Slack(process.env.MODUS_SLACK_SECRET),
      YouTube = require("./lib/YouTube"),
      yt = new YouTube(),
      MongoDB = require("./lib/MongoDB");

const topLevelComments = async () => {
  try {
    const videos = await yt.queryChannel();
    console.log("Number of videos:", videos.count);
    const comments = await yt.queryComments();

    for (let item of comments) {
      const snippet = item.snippet,
	    key = item.snippet.videoId,
	    comment = item.snippet,
	    video = videos[key];

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
	      d1 = new Date(csnippet.publishedAt),
	      elapsed = Math.round((now - d1)  / (1000 * 60 * 60 * 24));
	if (elapsed >= 2 && replyCount == 0) {
	  sorted.push({
	    replyCount: replyCount,
	    video: csnippet,
	    elapsed: elapsed,
	    date: d1,
	    text: `Comment on video ${snippet.title} has not been replied to for ${elapsed}  days.`});
	}
      }
    }

    sorted.sort((a, b) => {
      return a.date - b.date;
    });

    for (let comment of sorted) {
      await slack.SendMessage('youtube-slack-bot', comment.text);
      
    }
  }
  catch (e) {
    console.error("error", e);
  }
};

const wait = ms => new Promise(res => setTimeout(res, ms));

const main = async () => {
  await slack.SendMessage('youtube-slack-bot', "  ");
  await slack.SendMessage('youtube-slack-bot', "  ");
  await slack.SendMessage('youtube-slack-bot', "youtube-slack-bot started");
  await slack.SendMessage('youtube-slack-bot', "  ");
  await slack.SendMessage('youtube-slack-bot', "  ");
  const DAY = 24 * 60 * 60 * 1000,
	WAIT_TIME = DAY ;

  for (;;) {
    topLevelComments();
    await wait(WAIT_TIME);
  }
};

const drop = async () => {
  try {
    const result = MongoDB.DropDatabase();
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

// drop();
main();

