'use strict'

module.exports = function(service, opts, next) {
  if (!opts.amqpURL)
    return next(new Error('amqpURL is required'))

  service.client({
    name: 'mailer',
    channel: 'sitegate-mailer',
    url: opts.amqpURL,
    methods: [
      'create',
      'getById',
      'getById',
      'getByPublicId',
      'query',
      'remove',
      'update',
    ],
  })

  next()
}

module.exports.attributes = {
  name: 'mailer',
}
