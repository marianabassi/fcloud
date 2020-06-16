'use strict'

const api = require('./api.js');

api.listen(3000, function() {
  console.log('Cache api listening on port 3000!');
});