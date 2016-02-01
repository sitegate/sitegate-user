'use strict'
const joi = require('joi')
const crypto = require('crypto')
const thenify = require('thenify')

const ONE_DAY = 1000 * 60 * 60 * 24

module.exports = function(ms, opts) {
  let User = ms.plugins.models.User
  let mailer = ms.plugins.jimboClient.mailer

  ms.method({
    name: 'sendVerificationEmail',
    config: {
      validate: {
        userId: joi.string().required(),
      },
    },
    handler(params) {
      let user
      return ms.methods.getById({id: params.userId})
        .then(usr => {
          user = usr
          return thenify(crypto.randomBytes)(20)
        })
        .then(buffer => {
          let token = buffer.toString('hex')

          user.emailVerified = false
          user.emailVerificationToken = token

          user.emailVerificationTokenExpires = Date.now() + ONE_DAY

          return user.save()
        })
        .then(user => {
          mailer.send({
            templateName: 'email-verification-email',
            to: user.email,
            locals: {
              username: user.username,
              token: user.emailVerificationToken,
            },
          })

          return Promise.resolve()
        })
    },
  })
}

module.exports.attributes = {
  name: 'send-verification-email',
  dependencies: ['mailer'],
}
