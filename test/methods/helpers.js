'use strict'
const plugiator = require('plugiator')

function saveUser(newUser, user, cb) {
  newUser.save((err, newUser) => {
    if (err) return cb(err)

    user.id = newUser.id
    cb()
  })
}

exports.userCreator = user =>
  plugiator.anonymous((server, opts, next) => {
    let User = server.plugins.models.User

    let newUser = new User(user)

    server.decorate('server', 'fakeUser', newUser)

    if (!user.password)
      return saveUser(newUser, user, next)

    newUser.setPassword(user.password, err => {
      if (err) return next(err)
      saveUser(newUser, user, next)
    })
  })
