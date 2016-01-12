'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let ClientClient = ms.plugins['jimbo-client'].client

  ms.method({
    name: 'getTrustedClients',
    config: {
      validate: {
        userId: joi.string().required(),
      },
    },
    handler(params) {
      return User.findById(params.userId).exec()
        .then(user => {
          if (!user)
            return Promise.reject(new Error('user not found'))

          if (!user.trustedClients || user.trustedClients.length === 0)
            return Promise.resolve([])

          return ClientClient.query({ ids: user.trustedClients })
        })
    },
  })
}

module.exports.attributes = {
  name: 'get-trusted-clients',
}
