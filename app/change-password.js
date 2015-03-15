'use strict';

var User = require('../models/user');
var ServiceError = require('./service-error');

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
    return cb(new Error('userId is missing'));
  }

  if (!params.newPassword) {
    return cb(new Error('newPassword is missing'));
  }

  User.findById(params.userId, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new Error('User not found'));
    }

    if (typeof user.hash === 'undefined') {
      return saveNewPassword(user, params, cb);
    }
    user.authenticate(params.currentPassword, function (err, user, info) {
      if (err) {
        return cb(err);
      }

      return saveNewPassword(user, params, cb);
    });
  });
};