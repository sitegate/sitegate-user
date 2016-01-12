'use strict';
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'query',
    config: {
      validate: {
        count: joi.number().required(),
      },
    },
    handler(params) {
      params.fields = params.fields || []

      return User
        .find({}, params.fields.join(' '))
        .limit(params.count)
        .exec()
    },
  })
}

module.exports.attributes = {
  name: 'query',
}
