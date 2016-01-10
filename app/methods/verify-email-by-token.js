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
        emailVerificationTokenExpires: {
          $gt: Date.now(),
        },
      }, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('user not found'))
        }

        user.emailVerified = true
        user.emailVerificationToken = null

        user.save(function(err) {
          if (err) {
            return cb(err)
          }

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
