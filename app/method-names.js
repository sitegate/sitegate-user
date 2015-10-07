'use strict';

var fs = require('fs');

var methodNames = fs.readdirSync(__dirname  + '/methods/')
  .map(methodName => methodName.replace(/\.js$/, ''));

module.exports = methodNames;
