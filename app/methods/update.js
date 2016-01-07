'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User
  let sendVerificationEmail = ms.methods.sendVerificationEmail

  ms.method({
    name: 'update',
    config: {
      validate: joi.object().keys({
        id: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findById(params.id, function(err, user) {
        if (err) {
          return cb(err, user)
        }

        if (!user) {
          return cb(new Error('userNotFound'))
        }

        user.username = params.username || user.username

        let newEmail = params.email ? params.email.toLowerCase() : null
        let sendVerificationEmail

        if (typeof params.emailVerified === 'boolean') {
          user.emailVerified = params.emailVerified
        } else {
          let emailHasBeenUpdated = newEmail && (newEmail !== user.email)
          sendVerificationEmail = emailHasBeenUpdated

          if (emailHasBeenUpdated) {
            user.emailVerified = false
          }
        }

        user.email = newEmail
        user.role = params.role || user.role

        user.save(function(err, user) {
          if (err) {
            return cb(err, null)
          }

          if (sendVerificationEmail) {
            sendVerificationEmail({
              userId: user._id,
            })
          }

          return cb(err, user, {
            emailHasBeenUpdated: emailHasBeenUpdated,
          })
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'update',
}
