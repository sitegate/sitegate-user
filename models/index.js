'use strict';

const debug = require('debug')('sitegate:user');
const mongoose = require('mongoose');

module.exports = function(mongoURI) {
  let connection = mongoose.createConnection(mongoURI);

  connection.on('connected', () => debug('Mongoose connected in User microservice'));

  let models = {
    User: require('./user')(connection)
  };

  return models;
};
