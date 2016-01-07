'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  const User = ms.plugins.models.User

  ms.method({
    name: 'revokeClientAccess',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
        clientId: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findById(params.userId, function(err, user) {
        if (err) return cb(err)

        if (!user) return cb(new Error('User not found'))

        user.trustedClients
          .splice(user.trustedClients.indexOf(params.clientId), 1)

        user.save(err => cb(err, user))
      });
    },
  })

  next()
}

module.exports.attributes = {
  name: 'revoke-client-access',
}
