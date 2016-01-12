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
    handler(params) {
      let sendVerificationEmail
      let emailHasBeenUpdated

      return User.findById(params.id).exec()
        .then(user => {
          if (!user)
            return Promise.reject(new Error('userNotFound'))

          user.username = params.username || user.username

          let newEmail = params.email ? params.email.toLowerCase() : null

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

          return user.save()
        })
        .then(user => {
          if (sendVerificationEmail) {
            ms.methods.sendVerificationEmail({
              userId: user.id,
            })
          }

          return Promise.resolve({
            user,
            emailHasBeenUpdated,
          })
        })
    },
  })
}

module.exports.attributes = {
  name: 'update',
}
