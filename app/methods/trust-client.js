'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'trustClient',
    config: {
      validate: {
        userId: joi.string().required(),
        clientId: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          // TODO: check if client exists?
          user.trustedClients.push(params.clientId)
          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'trust-client',
}
