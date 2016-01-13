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
    handler(params) {
      let options = params.options || {}
      options.fields = options.fields || []

      return User.findById(params.id, options.fields.join(' ')).exec()
        .then(user => user ?
          Promise.resolve(user) : Promise.reject(new Error('User not found')))
    },
  });
}

module.exports.attributes = {
  name: 'get-by-id',
}
