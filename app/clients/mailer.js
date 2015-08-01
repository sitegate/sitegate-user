'use strict';

var Client = require('uva-amqp').Client;
var config = require('../../config');

var mailerClient = new Client({
  channel: 'mailer',
  url: config.get('amqpUrl')
});

mailerClient.register('send');

module.exports = mailerClient.methods;
