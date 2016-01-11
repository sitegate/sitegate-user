'use strict'
const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'disconnectProvider',
    config: {
      validate: {
        userId: joi.string().required(),
        strategy: joi.string().required(),
      },
    },
    handler(params, cb) {
      User.findById(params.userId, (err, user) => {
        if (err)
          return cb(err)

        if (!user)
          return cb(new Error('The logged user not found in the datastore'))

        if (user.provider.toLowerCase() === params.strategy.toLowerCase())
          return cb(new Error('Can\' disconnect the main provider'))

        if (!user.additionalProvidersData ||
            !user.additionalProvidersData[params.strategy])
          return cb(new Error('User doesn\'t have this provider'))

        delete user.additionalProvidersData[params.strategy]

        user.markModified('additionalProvidersData')

        user.save(err => {
          if (err) return cb(err)

          return cb(null, user)
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'disconnect-provider',
}
