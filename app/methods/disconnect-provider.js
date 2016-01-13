'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'disconnectProvider',
    config: {
      validate: {
        userId: joi.string().required(),
        strategy: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          if (user.provider.toLowerCase() === params.strategy.toLowerCase())
            return Promise
              .reject(new Error('Can\' disconnect the main provider'))

          if (!user.additionalProvidersData ||
              !user.additionalProvidersData[params.strategy])
            return Promise.reject(new Error('User doesn\'t have this provider'))

          delete user.additionalProvidersData[params.strategy]

          user.markModified('additionalProvidersData')

          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'disconnect-provider',
}
