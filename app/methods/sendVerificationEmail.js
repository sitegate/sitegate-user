'use strict';

var crypto = require('crypto');

var ONE_DAY = 1000 * 60 * 60 * 24;

module.exports = function(ms) {
  var User = ms.models.User;
  var mailer = ms.clients.mailer;

  return function sendVerificationEmail(userId, cb) {
    if (!userId) {
      return cb(new TypeError('userId required'), null);
    }

    User.findById(userId, function(err, user) {
      if (err) {
        return cb(err, null);
      }

      crypto.randomBytes(20, function(err, buffer) {
        if (err) {
          return cb(err, null);
        }

        var token = buffer.toString('hex');

        user.emailVerified = false;
        user.emailVerificationToken = token;

        user.emailVerificationTokenExpires = Date.now() + ONE_DAY;

        user.save(function(err, user) {
          if (err) {
            return cb(err, null);
          }

          mailer.send({
            templateName: 'email-verification-email',
            to: user.email,
            locals: {
              username: user.username,
              token: user.emailVerificationToken
            }
          }, function() {});

          return cb(null, null);
        });
      });
    });
  };
};
