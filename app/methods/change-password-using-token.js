'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let mailer = ms.plugins.jimboClient.mailer

  ms.method({
    name: 'changePasswordUsingToken',
    config: {
      validate: {
        token: joi.string().required(),
        newPassword: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.validateResetToken({
        token: params.token,
      })
      .then(user => {
        user.resetPasswordToken = undefined
        user.resetPasswordExpires = undefined

        return user.setPassword(params.newPassword)
      })
      .then(user => user.save())
      .then(user => {
        mailer.send({
          templateName: 'reset-password-confirm-email',
          to: user.email,
          locals: {
            username: user.username,
          },
        }, function() {})

        return Promise.resolve(user)
      })
    },
  })
}

module.exports.attributes = {
  name: 'change-password-using-token',
}
