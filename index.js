/**
 * youtube-slack-bot
 */

process.env.DEBUG='MongoDB';


const debug = require("debug")("youtube-slack-bot"),
      Slack = require("./lib/Slack"),
      slack = new Slack(process.env.MODUS_SLACK_SECRET),
      YouTube = require("./lib/YouTube"),
      MongoDB = require("./lib/MongoDB");

const main = async () => {
  // slack.SendMessage('youtube-slack-bot', 'Slack class here');
  try {
    const yt = new YouTube();
    const videos = await yt.queryChannel();
    console.log("Number of videos:", videos.count);
    const comments = await yt.queryComments();
    // console.log("comments", comments);

    for (let item of comments) {
      const snippet = item.snippet,
	    key = item.snippet.videoId,
	    comment = item.snippet,
	    video = videos[key];

      video.comments = video.comments || [];
      video.comments.push(comment);
    }

    // console.dir(videos, Object.keys(videos));
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
	// console.log("  c1: ", snip1.authorDisplayName, d1, d2);
	return d2 - d1;
      });
      
      // console.log("key", key, snippet.title);
      
      console.log(key, videos[key].snippet.title);
      console.log(" ", videos[key].snippet.description);
      const now = new Date();
      for (let comment of video.comments) {
	const csnippet = comment.topLevelComment.snippet;
	const d1 = new Date(csnippet.publishedAt);
	const elapsed = Math.round((now - d1)  / (1000 * 60 * 60 * 24));
	// console.log("    ",  `${elapsed} ${csnippet.publishedAt} [${csnippet.authorDisplayName}]`, csnippet.textDisplay);
	if (elapsed >= 2) {
	  sorted.push({ video: csnippet, date: d1, text: `Comment on video ${snippet.title} has not been replied to for ${elapsed}  days.`});
	}
      }
      console.log("");
    }

    sorted.sort((a, b) => {
      return a.date - b.date;
    });
    for (let comment of sorted) {
      // console.log("comment", comment);
      await slack.SendMessage('youtube-slack-bot', comment.text);
      
    }
    // console.log(data);
    // await yt.queryComments();
    // slack.SendMessage('youtube-slack-bot', 'Slack class here');
    // const res = await web.chat.postMessage({ channel: conversationId, text: 'I am dangerous!' });
    // console.log("Message Sent: ", res.ts);
  }
  catch (e) {
    console.error("error", e);
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
}

// drop();
main();

