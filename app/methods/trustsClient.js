'use strict';

const joi = require('joi')

module.exports = function(ms, opts, next) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'trustsClient',
    config: {
      validate: {
        userId: joi.string().required(),
        clientId: joi.string().required(),
      },
    },
    handler(params, cb) {
      User.findById(params.userId, function(err, user) {
        if (err) {
          return cb(err)
        }

        if (!user) {
          return cb(new Error('User not found'))
        }

        cb(null, user.trusts(params.clientId))
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'trusts-client',
}
