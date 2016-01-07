'use strict';

var methodNames = require('./method-names');

module.exports = function(opts) {
  opts = opts || {};

  if (!opts.models) {
    throw new Error('`opts.plugins.models` is required');
  }
  if (!opts.models.User) {
    throw new Error('`opts.plugins.models.User` is required');
  }
  if (!opts.clients) {
    throw new Error('`opts.clients` is required');
  }
  if (!opts.clients.mailer) {
    throw new Error('`opts.clients.mailer` is required');
  }
  if (!opts.clients.client) {
    throw new Error('`opts.clients.client` is required');
  }

  var ms = {
    models: opts.models,
    clients: opts.clients,
    methods: {}
  };
  methodNames.forEach(function(methodName) {
    var methodFactory = require('./methods/' + methodName);
    ms.methods[methodName.replace('.js', '')] = methodFactory(ms);
  });
  return ms.methods;
};
