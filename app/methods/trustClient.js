'use strict';

var User = require('../../models/user');

module.exports = function (params, cb) {
  params = params || {};

  if (!params.userId) {
    return cb(new Error('userId is missing'));
  }
  if (!params.clientId) {
    return cb(new Error('clientId is missing'));
  }

  User.findById(params.userId, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new Error('User not found'));
    }

    // TODO: check if client exists?
    user.trustedClients.push(params.clientId);
    user.save(function (err, user) {
      return cb(err, user);
    });
  });
};