'use strict';

var Client = require('uva-amqp').Client;
var config = require('../../config');

var client = new Client({
  channel: 'client',
  url: config.get('amqpUrl')
});

client.register('query');

module.exports = client.methods;
