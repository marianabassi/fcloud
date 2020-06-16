'use strict'

const random = require('randomstring');
const express = require('express');
const app = express();
const db = require('./database.js');

app.get('/api/cache', async (req, res) => {
  res.send(await db.keys());
});

app.get('/api/cache/:key', async (req, res) => {
  const key = req.params.key;
  let data = await db.get(key);
  if (!data) {
    console.log(`Cache miss for ${key}`);
    data = await db.put(key, random.generate());
  } else {
    console.log(`Cache hit for ${key}`);
  }
  res.send(data);
});

app.put('/api/cache/:key', async (req, res) => {
  const key = req.params.key;
  let data = await db.get(key);
  if (!data) {
    res.status(404).send({
      error: 'not found'
    });
  } else {
    await db.put(key, random.generate());
    res.send(data);
  }
});

app.delete('/api/cache/:key', async (req, res) => {
  const key = req.params.key;
  const data = await db.get(key);
  if (!data) {
    res.status(404).send({
      error: 'not found'
    });
  } else {
    await db.delete(key);
    res.send({
      deleted: true
    });
  }
});

app.delete('/api/cache', async (req, res) => {
  await db.deleteAll();
  res.send({
    deleted: true
  });
});

module.exports = app;