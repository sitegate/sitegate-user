'use strict';

const Server = require('uva-amqp').Server

module.exports = function(service, opts, next) {
  if (!opts.serviceName)
    return next(new Error('serviceName is required'))

  let server = new Server({
    channel: opts.serviceName,
    url: opts.url,
  })

  let defaultValidate = (value, cb) => cb(null, value)

  service.decorate({
    method(opts) {
      if (!opts.name)
        throw new Error('name is required')

      if (!opts.handler)
        throw new Error('handler is required')

      let validate = opts.config && opts.config.validate || defaultValidate

      server.addMethod(opts.name, function(params, cb) {
        validate(params, function(err, request) {
          if (err) return cb(err)

          return opts.handler(params, cb)
        })
      })
    },
  })

  next()
}

module.exports.attributes = {
  name: 'main',
}
