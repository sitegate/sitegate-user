'use strict'
const joi = require('joi')
const crypto = require('crypto')

const ONE_HOUR = 3600000

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let mailer = ms.plugins.mailer

  function sendPasswordResetEmail(user, cb) {
    crypto.randomBytes(20, function(err, buffer) {
      if (err) {
        return cb(err, null)
      }

      let token = buffer.toString('hex')

      user.resetPasswordToken = token
      user.resetPasswordExpires = Date.now() + ONE_HOUR

      user.save(function(err, user) {
        if (err) {
          return cb(err, null)
        }

        mailer.send({
          templateName: 'reset-password-email',
          to: user.email,
          locals: {
            username: user.username,
            token: user.resetPasswordToken,
          },
        }, cb)
      })
    })
  }

  ms.method({
    name: 'requestPasswordChangeByEmail',
    config: {
      validate: {
        email: joi.string().required(),
      },
    },
    handler(params, cb) {
      User.findOne({
        email: params.email.toLowerCase(),
      }, function(err, user) {
        if (err) {
          return cb(err, null)
        }

        if (!user) {
          return cb(new Error('There is no user with such email in our system'), null)
        }

        return sendPasswordResetEmail(user, cb)
      })
    },
  })
}

module.exports.attributes = {
  name: 'request-password-change-by-email',
}
