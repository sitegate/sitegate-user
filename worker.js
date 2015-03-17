var config = require('./config/config');
var bo = require('bograch');
var AmqpTransporter = require('bograch-amqp');

bo.use(new AmqpTransporter({
  amqpURL: config.amqpURL
}));

var server = bo.server('amqp', {
  name: 'user'
});

var routes = require('./app/routes');
routes(server);