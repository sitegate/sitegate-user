'use strict';

const registerPlugin = require('register-plugin');

function Service() {
}

Service.prototype.connection = function(connOpts) {
  this._connOpts = connOpts;
};

Service.prototype.register = function(plugins, cb) {
};
