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
      return User.findById(params.userId).exec()
        .then(user => {
          if (!user)
            return Promise.reject(new Error('User not found'))

          user.trustedClients.splice(0, user.trustedClients.length)

          return user.save()
        })
    },
  })
}

module.exports.attributes = {
  name: 'revoke-all-clients-access',
}
