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
  return lead0(d.getMonth()) + '/' + lead0(d.getDate()) + '/' + (''+d.getFullYear()).substr(2);
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
    output.push("       RECENTLY VIEWED VIDEOS");
    output.push("");
    output.push(`${format("VIEWS")}   PUBLISHED   TITLE`);
    output.push(`${format("-----")}   ---------   -----`);
    let count = 0;
    for (let i=0; i<sorted.length && count < 5; i++) {
      const rec = sorted[i],
	    views = rec.statistics.viewCount,
	    snippet = rec.snippet,
	    title = snippet.title,
	    published = new Date(rec.snippet.publishedAt),
	    // days28 = new Date(),
	    message = `${format(views)}   ${format_date(published)}    <http://youtube.com/watch?v=${rec.id.videoId}|${title}>`;

      // days28.setDate(days28.getDate() - 28);
      // console.log(title, published, days28);
      // if (published < days28) {
      // 	continue;
      // }
      output.push(message);
      count++;
    }
    output.push("");
    return output.join('\n');
  }
  catch (e) {
    slack.Exception(e);
  }
};

module.exports = mostViewed;

