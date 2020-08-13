/**
 *  mostViewed();
 *
 *  Display most viewed videos (top 5)
 *
 * Usage:
 *     await mostViewed();
 */

const debug = require('debug')("topLevelComments"),
      yt = require('../lib/YouTube'),
      slack = require('../lib/Slack'),
      mongo = require('../lib/MongoDB');

const format = (num)  => {
  return ("      " + num).slice(-8);
};

const lead0 = (num) => {
  num = '' +num;
  if (num.length == 1) {
    num = '0' + num;
  }
  return num;
};

const format_date = (d) => {
  return lead0(d.getMonth()) + '/' + lead0(d.getDate()) + '/' + d.getFullYear();
}
const mostViewed = async (videos) => {
  try {
    const vids = [];
    for (let key of Object.keys(videos)) {
      if (key !== 'count') {
	vids.push(videos[key]);
      }
    }

    const sorted = vids.sort((c1, c2) => {
      return c2.statistics.viewCount - c1.statistics.viewCount;
    });

    const output = [];

    output.push("");
    output.push("       TOP 5 MOST POPULAR VIDEOS");
    output.push("");
    output.push(`${format("VIEWS")}   PUBLISHED     TITLE`);
    output.push(`${format("-----")}   ---------     -----`);
    for (let i=0; i<5; i++) {
      const rec = sorted[i],
	    views = rec.statistics.viewCount,
	    snippet = rec.snippet,
	    title = snippet.title,
	    published = new Date(rec.snippet.publishedAt),
	    message = `${format(views)}   ${format_date(published)}    <http://youtube.com/watch?v=${rec.id.videoId}|${title}>`;

      console.log("rec", snippet);
      output.push(message);
    }
    output.push("");
    return output.join('\n');
    // slack.SendMessage(slack.channel, output.join('\n'));
  }
  catch (e) {
    console.error("topLevelComments error");
    console.error("  ", e.stack);
  }
};

module.exports = mostViewed;

