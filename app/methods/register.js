'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'register',
    config: {
      validate: {
        username: joi.string().required(),
        email: joi.string().required(),
        password: joi.string().required(),
        provider: joi.string().required(),
        displayName: joi.string(),
        emailVerified: joi.bool(),
      },
    },
    handler(params) {
      let user = new User(params)

      return User.findOne({username: user.username}).exec()
        .then(existingUser => {
          if (existingUser)
            return Promise.reject(new Error('username already exists'))

          return User.findOne({email: user.email}).exec()
        })
        .then(existingUser => {
          if (existingUser)
            return Promise.reject(new Error('email already exists'))

          return user.setPassword(params.password)
        })
        .then(() => user.save())
        .then(user => {
          if (!user.emailVerified)
            ms.methods.sendVerificationEmail({
              userId: user._id,
            }, function() {})

          return Promise.resolve(user)
        })
    },
  })
}

module.exports.attributes = {
  name: 'register',
}
