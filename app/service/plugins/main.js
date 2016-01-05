'use strict';

module.exports = function(service, opts, next) {
  let methods = {};

  let defaultValidate = (value, cb) => cb(null, value);

  service.decorate({
    method(opts) {
      if (!opts.name) {
        throw new Error('name is required');
      }

      if (!opts.handler) {
        throw new Error('handler is required');
      }

      if (methods[opts.name]) {
        throw new Error('method called ' + opts.name + ' already registered');
      }

      let validate = opts.config && opts.config.validate || defaultValidate;

      methods[opts.name] = function(params, cb) {
        validate(params, function(err, request) {
          if (err) {
            return cb(err);
          }

          return opts.handler(params, cb);
        });
      };
    },
  });

  next();
};

module.exports.attributes = {
  name: 'main',
};
