'use strict';

var bo = require('bograch');

var client = bo.client('amqp');

exports.sendMail = function (mail, cb) {
  client.call('mailer.send', mail, cb);
};