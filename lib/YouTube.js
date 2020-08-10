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
    const keys = [ 'COMMENTS', 'ACTIVITIES', 'CHANNEL', 'VIDEOS' ];
    for (key of keys) {
      debug(`resetDatabase(${key})`);
      await mongo.Remove(key);
    }
  }

  async queryChannels() {
    try {
      const KEY = 'CHANNELS',
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
      await mongo.Set(KEY, JSON.stringify(result.data.items));

      const items = result.items;
      return result.data.items;
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

  async queryChannel() {
    try {
      const KEY = 'CHANNEL',
	    records = await mongo.Get(KEY);
      if (records) {
	debug("cache hit!", KEY);
	return JSON.parse(records);
      }
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
      mongo.Set(KEY, JSON.stringify(videos));
      return videos;
    }
    catch (e) {
      console.log("===================");
      console.log("query e", e.stack);
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
