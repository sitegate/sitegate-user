'use strict'
module.exports = function(service, opts, next) {
  if (!opts.amqpURL)
    return next(new Error('amqpURL is required'))

  service.client({
    name: 'mailer',
    channel: 'sitegate-mailer',
    url: opts.amqpURL,
    methods: [
      'sendEmail',
    ],
  })

  next()
}

module.exports.attributes = {
  name: 'client',
}
