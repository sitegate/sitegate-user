'use strict';

var User = require('../../models/user');

module.exports = function (params, cb) {
  params = params || {};
  params.fields = params.fields || [];

  if (!params.count) {
    return cb(new Error('count is missing'));
  }

  User
    .find({}, params.fields.join(' '))
    .limit(params.count)
    .exec(cb);
};