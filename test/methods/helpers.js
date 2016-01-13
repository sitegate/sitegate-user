'use strict'
const plugiator = require('plugiator')

function saveUser(newUser, user, cb) {
  return newUser.save()
    .then(newUser => {
      user.id = newUser.id
      return Promise.resolve()
    })
}

exports.userCreator = user =>
  plugiator.anonymous((server, opts) => {
    let User = server.plugins.models.User

    let newUser = new User(user)

    server.decorate('server', 'fakeUser', newUser)

    if (!user.password)
      return saveUser(newUser, user)

    return newUser.setPassword(user.password)
      .then(() => saveUser(newUser, user))
  })
