'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'trustClient',
    config: {
      validate: joi.object().keys({
        userId: joi.string().required(),
        clientId: joi.string().required(),
      }),
    },
    handler(params, cb) {
      User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('User not found'))
        }

        // TODO: check if client exists?
        user.trustedClients.push(params.clientId)
        user.save(function(err, user) {
          return cb(err, user)
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'trust-client',
}
