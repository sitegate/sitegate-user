'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'validateResetToken',
    config: {
      validate: {
        token: joi.string().required(),
      },
    },
    handler(params, cb) {
      User.findOne({
        resetPasswordToken: params.token,
      }, function(err, user) {
        if (err)
          return cb(err, null)

        if (!user)
          return cb(new Error('Invalid reset token'), null)

        if (user.resetPasswordExpires < Date.now())
          return cb(new Error('Reset token expired'))

        return cb(null, null)
      })
    },
  })
}

module.exports.attributes = {
  name: 'validate-reset-token',
}
