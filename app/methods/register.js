'use strict';

var User = require('../../models/user');
var sendVerificationEmail = require('./sendVerificationEmail');

module.exports = function(fields, cb) {
  if (!fields.username) {
    return cb(new TypeError('missing Username'));
  }

  if (!fields.email) {
    return cb(new TypeError('missing Email'));
  }

  var user = new User(fields);

  User.findOne({
    username: user.username
  }, function(err, existingUser) {
    if (err) {
      return cb(err);
    }

    if (existingUser) {
      return cb(new Error('username already Exists'));
    }

    User.findOne({
      email: user.email
    }, function(err, existingUser) {
      if (err) {
        return cb(err);
      }

      if (existingUser) {
        return cb(new Error('email already Exists'));
      }

      user.setPassword(fields.password, function(err, user) {
        if (err) {
          return cb(err);
        }

        user.save(function(err) {
          if (err) {
            return cb(err);
          }

          if (!user.emailVerified) {
            sendVerificationEmail(user._id, function() {});
          }

          cb(null, user);
        });
      });
    });
  });
};
