'use strict'
const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'verifyEmailByToken',
    config: {
      validate: {
        token: joi.string().required(),
      },
    },
    handler(params, cb) {
      User.findOne({
        emailVerificationToken: params.token,
      }, function(err, user) {
        if (err) return cb(err)

        if (!user)
          return cb(new Error('Invalid email verification token'), null)

        if (user.emailVerificationTokenExpires < Date.now())
          return cb(new Error('Email verification token expired'))

        user.emailVerified = true
        user.emailVerificationToken = null

        user.save(function(err) {
          if (err) return cb(err)

          return cb(null, user)
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'verify-email-by-token',
}
