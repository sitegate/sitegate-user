'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'getById',
    config: {
      validate: {
        id: joi.string().required(),
      },
    },
    handler(params, cb) {
      let options = params.options || {}
      options.fields = options.fields || []

      User.findById(params.id, options.fields.join(' '), cb)
    },
  });
}

module.exports.attributes = {
  name: 'get-by-id',
}
