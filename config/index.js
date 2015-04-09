'use strict';

var util = require('util');
var convict = require('convict');

var config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  mongodb: {
    address: {
      doc: 'MongoDB address.',
      default: 'localhost',
      env: 'MONGO_PORT_27017_TCP_ADDR'
    },
    port: {
      doc: 'MongoDB port.',
      format: 'port',
      default: '27017',
      env: 'MONGO_PORT_27017_TCP_PORT'
    },
    name: {
      doc: 'MongoDB DB name.',
      default: 'sitegate-user-dev'
    }
  },
  amqp: {
    login: {
      doc: 'AMQP login.',
      default: 'guest'
    },
    password: {
      doc: 'AMQP password.',
      default: 'guest'
    },
    address: {
      doc: 'AMQP address.',
      default: 'localhost',
      env: 'RABBITMQ_PORT_5672_TCP_ADDR'
    },
    port: {
      doc: 'AMQP port.',
      format: 'port',
      default: '5672',
      env: 'RABBITMQ_PORT_5672_TCP_PORT'
    }
  }
});

// load environment dependent configuration
var env = config.get('env');
config.loadFile(__dirname + '/env/' + env + '.json');

// Adding the calculated values
config.load({
  mongodbUrl: util.format('mongodb://%s:%s/%s',
                          config.get('mongodb.address'),
                          config.get('mongodb.port'),
                          config.get('mongodb.name')),
  amqpUrl: util.format('amqp://%s:%s@%s:%s',
                         config.get('amqp.login'),
                         config.get('amqp.password'),
                         config.get('amqp.address'),
                         config.get('amqp.port'))
});

// perform validation
config.validate();

module.exports = config;
