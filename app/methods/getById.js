'use strict'

const joi = require('joi')

module.exports = function(ms, opts, next) {
  ms.method({
    name: 'getById',
    config: {
      validate: joi.object().keys({
        id: joi.string().required(),
      }),
    },
    handler(params, cb) {
      let options = params.options || {}
      options.fields = options.fields || []

      ms.models.User.findById(params.id, options.fields.join(' '), cb)
    },
  });

  next()
}

module.exports.attributes = {
  name: 'get-by-id',
}
