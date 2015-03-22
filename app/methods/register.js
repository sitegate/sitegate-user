'use strict';

var User = require('../../models/user');
var sendVerificationEmail = require('./sendVerificationEmail');
var ServerError = require('bograch').ServerError;

module.exports = function (user, cb) {
  var password = user.password;

  user = new User(user);

  if (!user.username) {
    return cb(new TypeError('missing Username'));
  }

  if (!user.email) {
    return cb(new TypeError('missing Email'));
  }
    
  User.findOne({
    username: user.username
  }, function (err, existingUser) {
    if (err) {
      return cb(err);
    }

    if (existingUser) {
      return cb(new ServerError('usernameExists', 'username already Exists'));
    }

    User.findOne({
      email: user.email
    }, function (err, existingUser) {
      if (err) {
        return cb(err);
      }

      if (existingUser) {
        return cb(new ServerError('emailExists', 'email already Exists'));
      }

      user.setPassword(password, function (err, user) {
        if (err) {
          return cb(err);
        }

        user.save(function (err) {
          if (err) {
            return cb(err);
          }

          if (!user.emailVerified) {
            sendVerificationEmail({
              userId: user._id,
              appTitle: undefined, //!?
              host: undefined //!?
            }, function () { });
          }

          cb(null, user);
        });
      });
    });
  });
};