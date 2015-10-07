'use strict';

var mongoose = require('mongoose');

module.exports = function(mongoURI) {
  var connection = mongoose.createConnection(mongoURI);

  connection.on('connected', function() {
    console.log('Mongoose connected in User microservice');
  });

  var models = {
    User: require('./user')(connection)
  };

  return models;
};
