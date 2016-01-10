'use strict'
const joi = require('joi')

module.exports = function(ms, opts, next) {
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
    handler(params, cb) {
      let user = new User(params)

      User.findOne({
        username: user.username,
      }, function(err, existingUser) {
        if (err) return cb(err)

        if (existingUser) return cb(new Error('username already exists'))

        User.findOne({
          email: user.email,
        }, function(err, existingUser) {
          if (err) return cb(err)

          if (existingUser)
            return cb(new Error('email already exists'))

          user.setPassword(params.password, function(err) {
            if (err) return cb(err)

            user.save(function(err) {
              if (err) return cb(err)

              if (!user.emailVerified)
                ms.methods.sendVerificationEmail({
                  userId: user._id,
                }, function() {})

              cb(null, user)
            })
          })
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'register',
}
