var config = require('./config/config');
var User = require('./models/user');
var bo = require('bograch');
var AmqpProvider = require('bograch-amqp');
var routes = require('./app/routes');

bo.use(new AmqpProvider({
  amqpURL: config.amqpURL
}));

var worker = bo.worker('amqp');

routes(worker);