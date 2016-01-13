'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  const User = ms.plugins.models.User

  ms.method({
    name: 'revokeAllClientsAccess',
    config: {
      validate: {
        userId: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          user.trustedClients.splice(0, user.trustedClients.length)
          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'revoke-all-clients-access',
}
