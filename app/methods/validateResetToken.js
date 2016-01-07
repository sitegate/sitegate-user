'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'validateResetToken',
    config: {
      validate: joi.object().keys({
        token: joi.string().required(),
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

        return cb(null, null)
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'validate-reset-token',
}
