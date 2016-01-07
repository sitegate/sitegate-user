'use strict'

module.exports = function(service, opts, next) {
  let User = service.plugins.models.User

  service.method({
    name: 'authenticate',
    handler(params, cb) {
      User.findOne({
        $or: [
          {
            username: params.usernameOrEmail,
          },
          {
            email: params.usernameOrEmail,
          },
        ],
      }, function(err, user) {
        if (err) {
          return cb(err, user)
        }

        if (!user) {
          return cb(new Error('incorrectUsernameOrEmail'), user)
        }

        return user.authenticate(params.password, cb)
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'authenticate-method',
  dependencies: ['models'],
}
