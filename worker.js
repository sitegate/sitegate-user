var config = require('./config');
var bo = require('bograch');
var amqpTransport = require('bograch-amqp');

bo.use(amqpTransport);

var server = bo.server('amqp', {
  name: 'user',
  amqpURL: config.get('amqpURL')
});

var routes = require('./app/routes');
routes(server);

server.start();