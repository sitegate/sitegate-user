'use strict'
const joi = require('joi')
const crypto = require('crypto')
const thenify = require('thenify')

const ONE_HOUR = 3600000

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let mailer = ms.plugins['jimbo-client'].mailer

  ms.method({
    name: 'requestPasswordChangeByEmail',
    config: {
      validate: {
        email: joi.string().required(),
      },
    },
    handler(params) {
      let user

      return User.findOne({email: params.email.toLowerCase()}).exec()
        .then(usr => {
          user = usr
          if (!usr)
            return Promise.reject(new Error('There is no user with such email in our system'))

          return thenify(crypto.randomBytes)(20)
        })
        .then(buffer => {
          let token = buffer.toString('hex')

          user.resetPasswordToken = token
          user.resetPasswordExpires = Date.now() + ONE_HOUR

          return user.save()
        })
        .then(user => mailer.send({
            templateName: 'reset-password-email',
            to: user.email,
            locals: {
              username: user.username,
              token: user.resetPasswordToken,
            },
          })
        )
    },
  })
}

module.exports.attributes = {
  name: 'request-password-change-by-email',
}
