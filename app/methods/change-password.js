'use strict'
const joi = require('joi')

function saveNewPassword(user, newPassword) {
  return user.setPassword(newPassword).then(user => user.save())
}

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User

  ms.method({
    name: 'changePassword',
    config: {
      validate: {
        userId: joi.string().required(),
        newPassword: joi.string().required(),
        currentPassword: joi.string(),
        forceNewPassword: joi.bool(),
      },
    },
    handler(params) {
      return ms.methods.getById({id: params.userId})
        .then(user => {
          if (params.forceNewPassword || typeof user.hash === 'undefined')
            return saveNewPassword(user, params.newPassword)

          return user.authenticate(params.currentPassword)
            .then(user => saveNewPassword(user, params.newPassword))
        })
    },
  })
}

module.exports.attributes = {
  name: 'changePassword',
}
