const debug = require("debug")("MongoDB"),
      MongoClient = require('mongodb').MongoClient,
      MONGO_URL = "mongodb://mongo:27017",
      MONGO_DB = 'youtube_slack_bot',
      MONGO_COLLECTION = 'youtube_slack_bot';

const wait = ms => new Promise(res => setTimeout(res, ms));

class MongoDB {
  constructor() {
    this.client = null;
    this.db = null;
    this.collection = null;
  }

  /**
   * GetDB()
   *
   * Get MongoClient/db- connecting to MongoDB if necessary.
   *
   * returns collection or null if failure.
   */
  async GetDB() {
    if (this.client == null) {
      const wait = ms => new Promise(res => setTimeout(res, ms));
      await wait(1000);
      try {
	debug("Connecting to", MONGO_URL);
	this.client = null;
	while (this.client == null) {
	  try {
	    this.client = await MongoClient.connect(MONGO_URL);
	  } catch (e) {}
	}
	debug("MongoDB connected to ", MONGO_URL);
	try {
	  this.db = await this.client.db(MONGO_DB);
	  this.collection = await this.db.collection(MONGO_COLLECTION);
	}
	catch (e) {
	  await wait(1000);
	  this.db = await this.client.db(MONGO_DB);
	  this.collection = await this.db.collection(MONGO_COLLECTION);
	}
      }
      catch (e) {
	console.error("Connect error to", MONGO_URL);
	console.error(e.message, e.stack);
	return null;
      }
    }
    return this.db;
  }

  /**
   * Remove(key);
   *
   * Remove a record whose key is the key argument
   *
   * Returns true if successful, false if not.
   */
  async Remove(key) {
    const db = await this.GetDB(),
	  collection = await db.collection(MONGO_COLLECTION);
    return await collection.deleteOne({key: key});
  }

  /**
   * DropDatabase();
   *
   * Remove all records from Database and remove the Database.
   *
   * Returns true if successful, false if not.
   */
  async DropDatabase() {
    const db = await this.GetDB()
    return await db.dropDatabase(MONGO_DB);
  }

  /**
   * Get(key);
   *
   * Get key = value in database.
   *
   * Returns true if successful, false if not.
   */
  async Get(key) {
    try {
      const db = await this.GetDB(),
	    collection = await db.collection(MONGO_COLLECTION);
      const record = await collection.findOne({ key: key });
      if (record) {
	return record.value;
      }
      else {
	return null;
      }
    }
    catch (e) {
      debug("Query error to", MONGO_URL, MONGO_DB, MONGO_COLLECTION);
      debug(e.message, e.stack);
      return null;
    }
  }

  /**
   * Set(key, value);
   *
   * Set key = value in database
   *
   * Note: value must be string - it is up to caller to JSON.stringify() the objects it wants to store in the DB.
   *
   * Returns true if successful, false if not.
   */
  async Set(key, value) {
    try {
      if (typeof value != "string") {
	debug("Replace(", key, ") - value is not a string!");
	return false;
      }
      const db = await this.GetDB(),
	    collection = await db.collection(MONGO_COLLECTION);
      const r = await collection.findOneAndReplace({ key: key}, {key: key, value: value});
      if (!r.value) {
	const i = await collection.insertOne({ key: key, value: value});
      }
    }
    catch (e) {
      debug("findOneAndReplace error", MONGO_URL, MONGO_DB, MONGO_COLLECTION);
      debug(e.message, e.stack);
      return  false;
    }
  }
};

module.exports = new MongoDB;
