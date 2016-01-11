'use strict';
const joi = require('joi')

module.exports = function(ms, opts) {
  ms.method({
    name: 'query',
    config: {
      validate: {
        count: joi.number().required(),
      },
    },
    handler(params, cb) {
      params.fields = params.fields || []

      ms.plugins.models.User
        .find({}, params.fields.join(' '))
        .limit(params.count)
        .exec(cb)
    },
  })
}

module.exports.attributes = {
  name: 'query',
}
