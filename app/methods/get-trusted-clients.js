'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let ClientClient = ms.plugins['jimbo-client'].client

  ms.method({
    name: 'getTrustedClients',
    config: {
      validate: {
        userId: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({
          id: params.userId,
        })
        .then(user => {
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
