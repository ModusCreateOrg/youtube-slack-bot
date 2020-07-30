/**
 * YouTube class
 *
 * Encapsulates YouTube Data API
 *
 * Requires ENV variable MODUS_YOUTUBE_SECRET to be set to the API KEY from the google dashboard.
 */

const debug = require("debug")("YouTube"),
      fs = require('fs');

const SECRET = process.env.MODUS_YOUTUBE_SECRET;
const CHANNELID = 'UCsKwL0-e2eHRNa6Ne99AESw';

const {google} = require('googleapis'),
      youtube = google.youtube({
	  version: 'v3',
	  auth: SECRET
      });


// console.log(youtube);
class YouTube {
    async queryChannels() {
	try {
	    const result = await youtube.channels.list({
		// auth: SECRET,
		part: 'snippet,contentDetails',
		// channelId: CHANNELID,
		id: CHANNELID,
	    });
	    const items = result.items;
	    // console.log("result", result);
	    console.log("items:", result.data.items)
	    console.log(result.data.items[0].contentDetails)
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
	    const result = await youtube.commentThreads.list({
		// auth: SECRET,
		part: [ 'snippet','replies' ],
		// part: 'snippet',
		// channelId: CHANNELID,
		allThreadsRelatedToChannelId: CHANNELID,
		// id: CHANNELID,
	    });
	    const items = result.data.items;
	    for (let item of items) {
		console.log("comment: ", item.snippet.topLevelComment.snippet.textDisplay);
	    }
	    // console.log("result", result);
	    // console.log("items:", items)
	    // console.log(items[0])
	    // console.log(items[0].snippet)
	    return result.data.items;
	}
	catch (e) {
	    console.log("===================");
	    console.log("query e", e);
	    throw e;
	}

    }

    async queryActivities() {
	try {
	    const result = await youtube.activities.list({
		// auth: SECRET,
		part: 'snippet,contentDetails',
		channelId: CHANNELID,
		id: CHANNELID,
	    });
	    // console.log("result", result);
	    console.log("items:", result.data.items)
	    return result.data.items;
	}
	catch (e) {
	    console.log("===================");
	    console.log("query e", e);
	    throw e;
	}
    }

    async queryVideos() {
	try {
	    // const uresult = await youtube.channels.list({
	    // 	part: 'snippet,contentDetails',
	    // 	id: CHANNELID
	    // });

	    // const uploads = uresult.data.items[0].contentDetails.relatedPlaylists.uploads;
	    // console.log("uploads", uploads);

	    let videos = [],
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
		console.log(presult.data.items.length, presult.data.items, presult.data.items.length);
		console.log(nextPageToken);
		count = presult.data.items.length;
		break;
	    } while (count == 50);
	    return;
	    
	    const result = await youtube.videos.list({
	    	// auth: SECRET,
	    	part: 'snippet,contentDetails',
	    	id: CHANNELID,
	    	// id: CHANNELID,
	    });
	    console.log("result", result);
	    console.log("items:", result.data.items)
	}
	catch (e) {
	    console.log("===================");
	    console.log("query e", e);
	    throw e;
	}
    }
};

module.exports = YouTube;
