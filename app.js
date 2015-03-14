'use strict';

var config = require('./config/config');
var mongoose = require('mongoose');

// Bootstrap db connection
var db = mongoose.connect(config.db, function (err) {
  if (err) {
    console.error('\x1b[31m', 'Could not connect to MongoDB!');
    console.log(err);
  }
});

require('./worker');

console.log('User microservice started');