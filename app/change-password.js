'use strict';

var User = require('../models/user');
var ServerError = require('bograch').ServerError;

function saveNewPassword(user, params, cb) {
  user.setPassword(params.newPassword, function (err, user) {
    if (err) {
      return cb(err);
    }

    user.save(function (err) {
      if (err) {
        return cb(err);
      }

      return cb(err, user);
    });
  });
}

module.exports = function (params, cb) {
  params = params || {};

  if (!params.userId) {
    return cb(new ServerError('argumentNull', 'userId is missing'));
  }

  if (!params.newPassword) {
    return cb(new ServerError('argumentNull', 'newPassword is missing'));
  }

  User.findById(params.userId, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new ServerError('userNotFound', 'User not found'));
    }

    if (typeof user.hash === 'undefined') {
      return saveNewPassword(user, params, cb);
    }
    user.authenticate(params.currentPassword, function (err, user) {
      if (err || !user) {
        return cb(err, user);
      }

      return saveNewPassword(user, params, cb);
    });
  });
};