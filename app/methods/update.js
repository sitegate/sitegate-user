'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let sendVerificationEmail = ms.methods.sendVerificationEmail

  ms.method({
    name: 'update',
    config: {
      validate: {
        id: joi.string().required(),
        username: joi.string(),
        email: joi.string(),
        emailVerified: joi.bool(),
        role: joi.string(),
      },
    },
    handler(params, cb) {
      User.findById(params.id, function(err, user) {
        if (err)
          return cb(err)

        if (!user)
          return cb(new Error('userNotFound'))

        user.username = params.username || user.username

        let newEmail = params.email ? params.email.toLowerCase() : null
        let sendVerificationEmail
        let emailHasBeenUpdated

        if (typeof params.emailVerified === 'boolean') {
          user.emailVerified = params.emailVerified
        } else {
          emailHasBeenUpdated = newEmail && (newEmail !== user.email)
          sendVerificationEmail = emailHasBeenUpdated

          if (emailHasBeenUpdated) {
            user.emailVerified = false
          }
        }

        user.email = newEmail
        user.role = params.role || user.role

        user.save(function(err, user) {
          if (err)
            return cb(err, null)

          if (sendVerificationEmail) {
            ms.methods.sendVerificationEmail({
              userId: user.id,
            })
          }

          return cb(err, {
            user,
            emailHasBeenUpdated,
          })
        })
      })
    },
  })
}

module.exports.attributes = {
  name: 'update',
}
