'use strict'

const joi = require('joi')
const crypto = require('crypto')

const ONE_DAY = 1000 * 60 * 60 * 24

module.exports = function(ms, opts, next) {
  let User = ms.models.User
  let mailer = ms.clients.mailer

  ms.method({
    name: 'sendVerificationEmail',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err, null)
        }

        crypto.randomBytes(20, function(err, buffer) {
          if (err) {
            return cb(err, null)
          }

          let token = buffer.toString('hex')

          user.emailVerified = false
          user.emailVerificationToken = token

          user.emailVerificationTokenExpires = Date.now() + ONE_DAY

          user.save(function(err, user) {
            if (err) {
              return cb(err, null)
            }

            mailer.send({
              templateName: 'email-verification-email',
              to: user.email,
              locals: {
                username: user.username,
                token: user.emailVerificationToken,
              },
            }, function() {})

            return cb(null, null)
          })
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'send-verification-email',
}
