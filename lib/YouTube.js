/**
 *
 */

const debug = require("debug")("YouTube"),
      fs = require('fs');

const {GoogleAuth} = require('google-auth-library'),
      {google} = require('googleapis'),
      youtube = google.youtubeAnalytics('v2');

const USERID = 'sKwL0-e2eHRNa6Ne99AESw',
      CHANNELID = 'UCsKwL0-e2eHRNa6Ne99AESw';

const scopes =  [
    "https://www.googleapis.com/auth/yt-analytics.readonly"
];

class YouTube {
    constructor(token) {
	try {
	    
	    const keys = fs.readFileSync(process.env.MODUS_YOUTUBE_KEYS);
	    this.keys = JSON.parse(fs.readFileSync(process.env.MODUS_YOUTUBE_KEYS));
	}
	catch (e) {
	    console.log("YouTube e", e);
	}
    }

    async authorize() {
	return new GoogleAuth({scopes: scopes});
	// return new google.auth.JWT(this.keys.client_email, this.keys.private_key, scopes, null);
    }

    async query() {
	const start = "2020-07-01",
	      end = "2020-07-09";

	try {
	    const auth = await this.authorize();
	    const client = await auth.getClient();
	    const projectId = await auth.getProjectId();
	    // console.log("query auth", auth);
	    // console.log('client', client);
	    // console.log('projectid', projectId);
	    let QUERY = {
		// 'ids': 'channel==' + CHANNELID,
		'ids': "channel==" + encodeURIComponent(CHANNELID),
		// 'ids': "channel==MINE",
		// 'ids': CHANNELID,
		'metrics': 'views',
		'dimensions': 'day',
		'startDate': start,
		'endDate': end,
	    };
	    console.log("query", QUERY);
	    QUERY.auth = auth;
	    youtube.reports.query(QUERY, (err, response) => {
		console.log("\n\n\n\n\n");
	    	console.log(err);
	    	console.log(response);
		console.log("\n\n\n\n\n");
	    });
	    // const service = google.youtube('v3');
	    // const result = await service.channels.list({
	    // 	auth: auth,
	    // 	part: 'snippet.contentDetails.statistics',
	    // 	forUsername: 'mike@moduscreate.com'
	    // });
	    // console.dir(result);
	}
	catch (e) {
	    console.log("===================");
	    console.log("query e", e);
	}
	console.log('CHANNELID', CHANNELID, encodeURIComponent(CHANNELID));
    }

};

module.exports = YouTube;

// modus_youtube_keys.txt
