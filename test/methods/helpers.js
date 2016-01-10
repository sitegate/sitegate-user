'use strict'
const plugiator = require('plugiator')

exports.userCreator = user =>
  plugiator.anonymous((server, opts, next) => {
    let User = server.plugins.models.User

    let newUser = new User(user)

    newUser.save(err => next(err))
  })
