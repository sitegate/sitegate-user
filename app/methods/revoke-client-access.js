'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  const User = ms.plugins.models.User

  ms.method({
    name: 'revokeClientAccess',
    config: {
      validate: {
        userId: joi.string().required(),
        clientId: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          let clientIndex = user.trustedClients.indexOf(params.clientId)

          if (clientIndex === -1)
            return Promise.reject(new Error('Client does\'t have access already'))

          user.trustedClients.splice(clientIndex, 1)

          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'revoke-client-access',
}
