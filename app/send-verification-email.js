'use strict';

var crypto = require('crypto');
var mailerClient = require('./clients/mailer-client');
var i18n = require('i18next');
var User = require('./models/user');

var ONE_DAY = 1000 * 60 * 60 * 24;

function sendVerificationEmail(params, cb) {
  params = params || {};

  if (!params.userId) {
    return cb(new TypeError('userId required'), null);
  }
  if (!params.host) {
    return cb(new TypeError('host required'), null);
  }
  if (!params.appTitle) {
    return cb(new TypeError('appTitle required'), null);
  }

  User.findById(params.userId, function (err, user) {
    if (err) {
      return cb(err, null);
    }

    crypto.randomBytes(20, function (err, buffer) {
      if (err) {
        return cb(err, null);
      }

      var token = buffer.toString('hex');

      user.emailVerified = false;
      user.emailVerificationToken = token;

      user.emailVerificationTokenExpires = Date.now() + ONE_DAY;

      user.save(function (err, user) {
        if (err) {
          return cb(err, null);
        }

        mailerClient.sendMail({
          templateName: 'email-verification-email',
          to: user.email,
          locals: {
            username: user.username,
            confirmationUrl: 'http://' + params.host +
              '/verify-email/' + user.emailVerificationToken,
            siteName: params.appTitle
          }
        });
      });
    });
  });
}

module.exports = sendVerificationEmail;