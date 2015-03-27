'use strict';

var User = require('../../models/user');

module.exports = function (token, cb) {
  if (!token) {
    return cb(new Error('token is missing'));
  }

  User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(new Error('user not found'));
    }

    user.emailVerified = true;
    user.emailVerificationToken = null;

    user.save(function (err) {
      if (err) {
        return cb(err);
      }

      return cb(null, user);
    });
  });
};