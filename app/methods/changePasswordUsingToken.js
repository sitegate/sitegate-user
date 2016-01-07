'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User
  let mailer = ms.plugins.mailer

  ms.method({
    name: 'changePasswordUsingToken',
    config: {
      validate: joi.object().keys({
        token: joi.string().required(),
        newPassword: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findOne({
        resetPasswordToken: params.token,
        resetPasswordExpires: {
          $gt: Date.now(),
        },
      }, function(err, user) {
        if (err) {
          return cb(err, null)
        }

        if (!user) {
          return cb(new Error('Invalid reset token'), null)
        }

        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        user.setPassword(params.newPassword, function(err, user) {
          if (err) {
            return cb(err, null)
          }

          user.save(function(err) {
            if (err) {
              return cb(err, null)
            }

            mailer.send({
              templateName: 'reset-password-confirm-email',
              to: user.email,
              locals: {
                username: user.username,
              },
            }, function() {})

            return cb(null, user)
          })
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'change-password-using-token',
}
