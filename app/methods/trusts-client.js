'use strict';
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'trustsClient',
    config: {
      validate: {
        userId: joi.string().required(),
        clientId: joi.string().required(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          return Promise.resolve(user.trusts(params.clientId))
        })
    },
  })
}

module.exports.attributes = {
  name: 'trusts-client',
}
