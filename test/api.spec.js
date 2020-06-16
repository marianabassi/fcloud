'use strict'

const mongodb = require('mongodb-memory-server');
const MongoMemoryServer = mongodb.MongoMemoryServer;
const mongod = new MongoMemoryServer();

const chai = require('chai'),
  chaiHttp = require('chai-http'),
  expect = chai.expect,
  should = chai.should();

chai.use(chaiHttp);
let api;

describe('cache api', function() {
  before(async function() {
    const uri = await mongod.getUri();
    const db = await require('../database.js')(uri);
    api = require('../api.js')(db);
  });
  it('Should get a brand new value', async function() {
    const res = await chai.request(api).get('/api/cache/buddy');
    res.should.have.status(200);
    res.body.should.be.an('object');
    res.body.value.should.be.an('string')
  });
  it('Should get a list of keys', async function() {
    const res = await chai.request(api).get('/api/cache');
    res.should.have.status(200);
    res.body.should.be.an('array').of.length(1);
    res.body[0].should.be.equals('buddy')
  });
  it('Should update a key', async function() {
    const res = await chai.request(api).get('/api/cache/buddy');
    const oldValue = res.body.value;

    await chai.request(api).put('/api/cache/buddy');
    res.should.have.status(200);

    const newRes = await chai.request(api).get('/api/cache/buddy');
    newRes.should.have.status(200);
    newRes.body.value.should.not.be.equals(oldValue);
  });
  it('Should delete a key', async function() {
    const res = await chai.request(api).delete('/api/cache/buddy');
    res.should.have.status(200);

    const newRes = await chai.request(api).get('/api/cache');
    newRes.should.have.status(200);
    newRes.body.should.be.an('array').of.length(0);
  });
  it('Should delete all keys', async function() {
    await chai.request(api).get('/api/cache/buddy1');
    await chai.request(api).get('/api/cache/buddy2');
    await chai.request(api).get('/api/cache/buddy3');
    const listRes = await chai.request(api).get('/api/cache');
    listRes.should.have.status(200);
    listRes.body.should.be.an('array').of.length(3);

    const res = await chai.request(api).delete('/api/cache');
    res.should.have.status(200);

    const newRes = await chai.request(api).get('/api/cache');
    newRes.should.have.status(200);
    newRes.body.should.be.an('array').of.length(0);
  });
});