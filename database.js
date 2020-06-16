'use strict'
const MongoClient = require('mongodb').MongoClient;

const TTL = 3000;
const MAX_KEYS = 5;

async function checkMax(collection) {
  const diff = await collection.countDocuments() - MAX_KEYS;
  if (diff > 0) {
    // removing oldest documents first
    (await collection.find({}, {
      order: {
        expireIn: 1
      }
    }).limit(diff).toArray()).forEach(async (data) => {
      await collection.deleteOne({
        _id: data._id
      });
    })
  }
}

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
          checkMax(collection);
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
      checkMax(collection);
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