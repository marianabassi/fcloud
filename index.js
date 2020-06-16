'use strict'
require('./database.js')().then((db) => {
  const api = require('./api.js')(db);
  api.listen(3000, function() {
    console.log('Cache api listening on port 3000!');
  });
});