var util = require('util');

function ServiceError(name, message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = name || 'authorizationError';
  this.message = message || null;
}

util.inherits(ServiceError, Error);

module.exports = ServiceError;