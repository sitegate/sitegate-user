'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'verifyEmailByToken',
    config: {
      validate: {
        token: joi.string().required(),
      },
    },
    handler(params) {
      return User.findOne({
          emailVerificationToken: params.token,
        }).exec()
        .then(user => {
          if (!user)
            return Promise.reject(new Error('Invalid email verification token'))

          if (user.emailVerificationTokenExpires < Date.now())
            return Promise.reject(new Error('Email verification token expired'))

          user.emailVerified = true
          user.emailVerificationToken = null

          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'verify-email-by-token',
}
