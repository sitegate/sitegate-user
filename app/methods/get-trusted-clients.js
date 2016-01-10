'use strict'
const joi = require('joi')

module.exports = function(ms, opts, next) {
  ms.method({
    name: 'getTrustedClients',
    config: {
      validate: {
        userId: joi.string().required(),
      },
    },
    handler(params, cb) {
      ms.plugins.models.User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('user not found'))
        }

        if (!user.trustedClients || user.trustedClients.length === 0) {
          return cb(null, [])
        }

        ms.plugins.client.query({ ids: user.trustedClients }, cb)
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'get-trusted-clients',
}
