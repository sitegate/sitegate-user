'use strict';

var fs = require('fs');

module.exports = function (server) {
  var methods = fs.readdirSync(__dirname  + '/methods/');
  
  var scope = {};
  methods.forEach(function (method) {
    scope[method.replace('.js', '')] = require('./methods/' + method);
  });
  server.addMethods(scope);
};