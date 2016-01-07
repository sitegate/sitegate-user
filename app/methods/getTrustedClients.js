'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  ms.method({
    name: 'getTrustedClients',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
      }),
    },
    handler(params, cb) {
      ms.models.User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('user not found'))
        }

        if (!user.trustedClients || user.trustedClients.length === 0) {
          return cb(null, [])
        }

        ms.clients.client.query({ ids: user.trustedClients }, cb)
      })
    },
  })

  next()
}

module.exports = {
  name: 'get-trusted-clients',
}
