'use strict'
module.exports = function(service, opts) {
  if (!opts.amqpURL) throw new Error('amqpURL is required')

  return service.client({
    name: 'mailer',
    channel: 'sitegate-mailer',
    amqpURL: opts.amqpURL,
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
}

module.exports.attributes = {
  name: 'mailer',
}
