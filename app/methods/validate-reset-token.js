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
    handler(params) {
      return User.findOne({
          resetPasswordToken: params.token,
        }).exec()
        .then(user => {
          if (!user)
            return Promise.reject(new Error('Invalid reset token'))

          if (user.resetPasswordExpires < Date.now())
            return Promise.reject(new Error('Reset token expired'))

          return Promise.resolve(user)
        })
    },
  })
}

module.exports.attributes = {
  name: 'validate-reset-token',
}
