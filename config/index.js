'use strict';

var convict = require('convict');

var config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  mongodbURL: {
    doc: 'MongoDB endpoint.',
    default: 'mongodb://localhost/sitegate-user-dev',
    env: 'MONGODB_URL'
  },
  amqpURL: {
    doc: 'AMQP endpoint.',
    default: 'amqp://guest:guest@localhost:5672',
    env: 'AMQP_URL'
  }
});

// load environment dependent configuration
var env = config.get('env');
config.loadFile('./config/env/' + env + '.json');

// perform validation
config.validate();

module.exports = config;