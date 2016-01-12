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
      return User.findById(params.userId)
        .then(user => {
          if (!user) {
            return Promise.reject(new Error('User not found'))
          }

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
