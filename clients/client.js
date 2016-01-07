'use strict'

const Client = require('uva-amqp').Client

module.exports = function(service, opts, next) {
  if (!opts.amqpURL)
    return next(new Error('amqpURL is required'))

  let client = new Client({
    channel: 'sitegate-mailer',
    url: opts.amqpURL,
  })

  client.register([''])

  service.expose(client)

  next()
}

module.exports.attributes = {
  name: 'mailer',
}
