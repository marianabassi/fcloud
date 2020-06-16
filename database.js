'use strict'
const MongoClient = require('mongodb').MongoClient;

// 3 thousand miliseconds / 3 seconds
const TTL = 3000;
const MAX_KEYS = 10;

module.exports = async (uri) => {
  const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  };
  const client = new MongoClient(uri || 'mongodb://localhost', options);
  await client.connect();
  const collection = client.db('cache').collection('cache');
  return {
    get: async (key) => {
      let data = await collection.findOne({
        '_id': key
      });
      if (data) {
        if (Date.now() >= data.expireIn) {
          return null;
        } else {
          data.expireIn = Date.now() + TTL
          await collection.update({
            '_id': key
          }, {
            expireIn: data.expireIn,
            value: data.value
          }, {
            upsert: true
          });
          return data;
        }
      }
      return null;
    },
    put: async (key, value) => {
      const data = {
        value,
        expireIn: Date.now() + TTL
      };
      await collection.update({
        _id: key
      }, data, {
        upsert: true
      });
      return data;
    },
    keys: async () => {
      return (await collection.find().toArray()).map((i) => i._id);
    },
    delete: async (key) => {
      await collection.deleteOne({
        _id: key
      });
    },
    deleteAll: async () => {
      await collection.deleteMany({});
    }
  }
}