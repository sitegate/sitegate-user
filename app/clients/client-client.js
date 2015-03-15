'use strict';

var bo = require('bograch');

var client = bo.client('amqp');

exports.sendMail = function (params, cb) {
  client.call('client.getByIds', params, cb);
};