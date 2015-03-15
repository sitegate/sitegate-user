var config = require('./config/config');
var bo = require('bograch');
var AmqpProvider = require('bograch-amqp');

bo.use(new AmqpProvider({
  amqpURL: config.amqpURL
}));

var worker = bo.worker('amqp');

var routes = require('./app/routes');
routes(worker);