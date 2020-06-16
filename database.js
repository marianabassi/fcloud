'use strict'

const db = {};

// 3 mil milisecundos, ou seja 3 segundos
// 3 thousand miliseconds, or being, 3 seconds (XD XD XD)
const TTL = 3000;
const MAX_KEYS = 10;

module.exports = {
  get: async (key) => {
    if (db[key]) {
      if (Date.now() >= db[key].expireIn) {
        return null;
      } else {
        db[key].expireIn = Date.now() + TTL;
        return db[key];
      }
    } else {
      return null;
    }
  },
  put: async (key, value) => {
    db[key] = {
      value,
      expireIn: Date.now() + TTL
    };
    return db[key];
  },
  keys: async () => {
    return Object.keys(db);
  },
  delete: async (key) => {
    delete db[key];
  },
  deleteAll: async () => {
    Object.keys(db).forEach(k => delete db[k]);
  }
}