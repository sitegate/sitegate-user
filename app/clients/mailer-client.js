'use strict';

var bo = require('bograch');

var mailerClient = bo.client('amqp', {
  name: 'mailer'
});

mailerClient.register('send');

module.exports = mailerClient.methods;