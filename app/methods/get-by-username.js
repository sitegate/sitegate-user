'use strict'
const joi = require('joi')

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'getByUsername',
    config: {
      validate: {
        username: joi.string().required(),
      },
    },
    handler(params) {
      let options = params.options || {}
      options.fields = options.fields || []

      return User
        .findOne({ username: params.username }, options.fields.join(' ')).exec()
    },
  });
}

module.exports.attributes = {
  name: 'get-by-username',
}
