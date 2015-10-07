'use strict';

var createModels = require('../models');
var createApp = require('../app');

function createMicroservice(opts) {
  opts = opts || {};

  if (!opts.mongoURI) {
    throw new Error('opts.mongoURI is required');
  }

  return createApp({
    models: createModels(opts.mongoURI),
    clients: opts.clients
  });
}

module.exports = createMicroservice;
