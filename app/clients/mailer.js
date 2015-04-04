'use strict';

var bo = require('bograch');
var config = require('../../config');

var mailerClient = bo.client('amqp', {
  name: 'mailer',
  amqpURL: config.get('amqpURL')
});

mailerClient.register('send');

mailerClient.connect();

module.exports = mailerClient.methods;