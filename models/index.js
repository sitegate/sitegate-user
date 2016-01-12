'use strict'
const debug = require('debug')('sitegate:user')
const mongoose = require('mongoose')

module.exports = function(service, opts, next) {
  if (!opts.mongoURI)
    return next(new Error('mongoURI is required'))

  let connection = mongoose.createConnection(opts.mongoURI)

  connection.on('connected', () => debug('Mongoose connected in User microservice'))

  service.expose({
    User: require('./user')(connection),
  })

  next()
}

module.exports.attributes = {
  name: 'models',
}
