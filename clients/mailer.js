'use strict'
module.exports = function(service, opts) {
  if (!opts.amqpURL) throw new Error('amqpURL is required')

  return service.client({
    name: 'mailer',
    channel: 'sitegate-mailer',
    amqpURL: opts.amqpURL,
    methods: [
      'sendEmail',
    ],
  })
}

module.exports.attributes = {
  name: 'client',
}
