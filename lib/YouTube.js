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
  /**
   * resetDatabase()
   *
   * Removes the keys for cached YouTube API queries.
   */
  async resetDatabase() {
    const keys = [ 'STATISTICS', 'COMMENTS', 'SUBSCRIPTIONS', 'VIDEOSTATS', 'CHANNEL', ];
    for (let key of keys) {
      debug(`resetDatabase(${key})`);
      await mongo.Remove(key);
    }
  }

  /**
   * queryChannelStatistics()
   *
   * Gather statistics for the channel.  Data are cached until resetDatabase is called.
   */
  async queryChannelStatistics() {
    try {
      const KEY = 'STATISTICS',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }

      debug(`\n\ncache miss ${KEY}\n`);
      const result = await youtube.channels.list({
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

  /**
   * queryComments()
   *
   * Gather comments for the channel.  Data are cached until resetDatabase is called.
   * Caller must sort through the comments to figure out what video they apply to.
   */
  async queryComments() {
    try {
      const KEY = 'COMMENTS',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }

      debug(`\n\ncache miss ${KEY}\n`);
      const result = await youtube.commentThreads.list({
	part: [ 'snippet','replies' ],
	allThreadsRelatedToChannelId: CHANNELID,
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

  /**
   * querySubscriptions()
   *
   * Gather subscriptions for the channel.  Data are cached until resetDatabase is called.
   */
  async querySubscriptions() {
    try {
      const KEY = 'SUBSCRIPTIONS',
	    records = await mongo.Get(KEY);

      if (records) {
	debug("cache hit!", KEY);
	return JSON.parse(records);
      }

      debug(`\n\ncache miss ${KEY}\n`);
      const result = await youtube.subscriptions.list({
	auth: SECRET,
	part: 'snippet,contentDetails,subscriberSnippet',
	channelId: CHANNELID,
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

  /**
   * queryVideoStatistics(videos);
   *
   * Gather statistics for the videos specified in the videos argument.  Data are cached until resetDatabase is called.
   * Each video has a statistics member object added to it by this method.
   */
  async queryVideoStatistics(videos) {
    try {
      const KEY = 'VIDEOSTATS',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }

      debug(`\n\ncache miss ${KEY}\n`);

      let ids = [],
	  items = [];

      for (let key of Object.keys(videos)) {
	ids.push(key);
      }

      // mschwartz says "I think we might not be able to query for more than 50 at a time"
      while (ids.length > 0) {
	let result = await youtube.videos.list({
	  part: 'snippet,statistics',
	  id: ids.slice(0,50).join(','),
	});
	ids = ids.slice(50);
	items = items.concat(result.data.items);
      }

      return items;
    }
    catch (e) {
      console.log("queryVideoStatistics", e);
    }
  }

  /**
   * queryChannelVideos()
   *
   * Gather videos for the channel (via search api call).  Data are cached until resetDatabase is called.
   * Each video has a statistics member object added to it by this method, which calls queryVideoStatistics() .
   */
  async queryChannelVideos() {
    try {
      const KEY = 'CHANNEL',
	    records = await mongo.Get(KEY);

      if (records) {
      	debug("cache hit!", KEY);
      	return JSON.parse(records);
      }

      debug(`\n\ncache miss ${KEY}\n`);
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

  /**
   * Return the authorized YouTube instance.
   */
  async Get() {
    return yt;
  }
}

yt = new YouTube;

module.exports = yt;
