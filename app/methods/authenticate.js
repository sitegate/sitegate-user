'use strict'
const joi = require('joi')

module.exports = function(service, opts) {
  let User = service.plugins.models.User

  service.method({
    name: 'authenticate',
    config: {
      validate: {
        usernameOrEmail: joi.string().required(),
        password: joi.string().required(),
      },
    },
    handler(params) {
      return User.findOne({
        $or: [
          {
            username: params.usernameOrEmail,
          },
          {
            email: params.usernameOrEmail,
          },
        ],
      })
      .exec()
      .then(user => {
        if (!user)
          return Promise.reject(new Error('incorrectUsernameOrEmail'))

        return user.authenticate(params.password)
      })
    },
  })
}

module.exports.attributes = {
  name: 'authenticate-method',
  dependencies: ['models'],
}
