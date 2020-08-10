/**
 * YouTube class
 *
 * Encapsulates YouTube Data API
 *
 * Requires ENV variable MODUS_YOUTUBE_SECRET to be set to the API KEY from the google dashboard.
 */

const debug = require("debug")("YouTube");

const SECRET = process.env.MODUS_YOUTUBE_SECRET;
const CHANNELID = 'UCsKwL0-e2eHRNa6Ne99AESw';

const mongo = require("./MongoDB");

const {google} = require('googleapis'),
      youtube = google.youtube({
	version: 'v3',
	auth: SECRET
      });

let yt = null;

class YouTube {
  async resetDatabase() {
    const keys = [ 'COMMENTS', 'ACTIVITIES', 'CHANNEL', 'VIDEOS', 'STATISTICS' ];
    for (key of keys) {
      debug(`resetDatabase(${key})`);
      await mongo.Remove(key);
    }
  }

  async queryChannelStatistics() {
    try {
      const KEY = 'STATISTICS',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }
      
      const result = await youtube.channels.list({
	// auth: SECRET,
	part: 'snippet,contentDetails,statistics',
	id: CHANNELID,
      });

      const items = result.data.items;
      await mongo.Set(KEY, JSON.stringify(items[0].statistics));
      return items[0].statistics;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e);
      throw e;
    }
  }

  async queryComments() {
    try {
      const KEY = 'COMMENTS',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }

      const result = await youtube.commentThreads.list({
	// auth: SECRET,
	part: [ 'snippet','replies' ],
	// part: 'snippet',
	// channelId: CHANNELID,
	allThreadsRelatedToChannelId: CHANNELID,
	// id: CHANNELID,
      });
      await mongo.Set(KEY, JSON.stringify(result.data.items));
      const items = result.data.items;
      return result.data.items;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e);
      throw e;
    }

  }

  async querySubscriptions() {
    try {
      const KEY = 'SUBSCRIPTIONS',
	    records = await mongo.Get(KEY);
      if (records) {
	debug("cache hit!", KEY);
	return JSON.parse(records);
      }

      const result = await youtube.subscriptions.list({
	auth: SECRET,
	part: 'snippet,contentDetails,subscriberSnippet',
	// mine: true,
	// part: 'snippet',
	// mySubscribers: true,
	// forChannelId: CHANNELID,
	channelId: CHANNELID,
	// id: CHANNELID,
      });
      console.log("result", result);
      return result.data.items;;
    }
    catch (e) {
      console.log("");
      console.log("===================");
      console.log("query e", e.stack);

      throw e;
    }
    
  }

  async queryActivities() {
    const KEY = 'ACTIVITIES',
	  records = await mongo.Get(KEY);
    if (records) {
      debug("cache hit!", KEY);
      return JSON.parse(records);
    }
    try {
      const result = await youtube.activities.list({
	// auth: SECRET,
	part: 'snippet,contentDetails',
	channelId: CHANNELID,
	id: CHANNELID,
      });
      // console.log("result", result);
      console.log("items:", result.data.items)
      await mongo.Set(KEY, JSON.stringify(result.data.items));
      return result.data.items;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e);
      throw e;
    }
  }

  async queryVideoStatistics(videos) {
    try {
      const KEY = 'VIDEOSTATS',
	    records = await mongo.Get(KEY);

      // if (records) {
      // 	debug("cache hit!", KEY);
      // 	return JSON.parse(records);
      // }

      const ids = [];
      for (let key of Object.keys(videos)) {
	ids.push(key);
      }
      let result = await youtube.videos.list({
	part: 'snippet,statistics',
	id: ids.join(','),
	// nextPageToken: nextPageToken,
	// maxResults: 50
      });
      return result.data.items;
    }
    catch (e) {
      console.log("queryVideoStatistics", e);
    }
  }

  async queryChannelVideos() {
    try {
      const KEY = 'CHANNEL',
	    records = await mongo.Get(KEY);

      // if (records) {
      // 	debug("cache hit!", KEY);
      // 	return JSON.parse(records);
      // }

      debug("cache miss");
      let videos = { count: 0},
	  count =0,
	  page = 1,
	  nextPageToken = undefined;
      do {
	let presult = await youtube.search.list({
	  part: 'snippet',
	  channelId: CHANNELID,
	  nextPageToken: nextPageToken,
	  maxResults: 50
	});
	nextPageToken = presult.data.nextPageToken;
	for (let record of presult.data.items) {
	  if (record.id && !record.id.playlistId && record.id.videoId) {
	    videos[record.id.videoId] = record;
	    videos.count++;
	  }
	}
      } while (count == 50);
      const  vstats = await yt.queryVideoStatistics(videos);
      console.log(vstats[0].snippet.thumbnails.default.url);
      for (let i=0; i<vstats.length; i++) {
	const statistics = vstats[i].statistics,
	      id = vstats[i].id;;
      	const stats = {
	  viewCount: parseInt(statistics.viewCount, 10),
	  likeCount: parseInt(statistics.likeCount, 10),
	  dislikeCount: parseInt(statistics.dislikeCount, 10),
	  favoriteCount: parseInt(statistics.favoriteCount, 10),
	  commentCount: parseInt(statistics.commentCount, 10),
	  thumbnail: vstats[i].snippet.thumbnails.default.url,
      	};
	if (!videos[id]) {
	  console.log("Video not found: ", id);
	}
	else {
	  videos[id].statistics = stats;
	  // console.log("id", id, "stats", JSON.stringify(stats));
	}
      }
      mongo.Set(KEY, JSON.stringify(videos));
      return videos;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e);
      return [];
    }
  }

  async queryVideos(videos) {
    try {
      const KEY = 'VIDEOS',
	    records = await mongo.Get(KEY);
      if (records) {
	debug("cache hit!", KEY);
	return JSON.parse(records);
      }
      const result = await youtube.videos.list({
	// auth: SECRET,
	part: 'snippet,contentDetails',
	id: videos.join(',')
	// id: CHANNELID,
	// id: CHANNELID,
      });
      console.log("result", result);
      return result.data.items;;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e);
      throw e;
    }
  }

  async Get() {
    return yt;
  }
}

yt = new YouTube;

module.exports = yt;
