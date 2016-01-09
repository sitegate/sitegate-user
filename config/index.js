'use strict'
const util = require('util')
const fs = require('fs')
const yamlOrJSON = require('yaml-or-json')
const convict = require('convict')

let config = convict({
  env: {
    doc: 'The applicaton environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },
  amqp: {
    login: {
      doc: 'AMQP login.',
      default: 'guest',
    },
    password: {
      doc: 'AMQP password.',
      default: 'guest',
    },
    address: {
      doc: 'AMQP address.',
      default: 'localhost',
      env: 'RABBITMQ_PORT_5672_TCP_ADDR',
    },
    port: {
      doc: 'AMQP port.',
      format: 'port',
      default: '5672',
      env: 'RABBITMQ_PORT_5672_TCP_PORT',
    },
  },
  mongodb: {
    address: {
      doc: 'MongoDB address.',
      default: 'localhost',
      env: 'MONGO_PORT_27017_TCP_ADDR',
    },
    port: {
      doc: 'MongoDB port.',
      format: 'port',
      default: '27017',
      env: 'MONGO_PORT_27017_TCP_PORT',
    },
    name: {
      doc: 'MongoDB DB name.',
      default: 'sitegate-user-dev',
    },
  },
});

// load environment dependent configuration
let env = config.get('env')
let filePath = __dirname + '/env/' + env
let configFile
try {
  configFile = yamlOrJSON(filePath) || {}
} catch (err) {
  configFile = {}
}

config.load(configFile)

// Adding the calculated values
config.load({
  amqpURI: util.format(
    'amqp://%s:%s@%s:%s',
    config.get('amqp.login'),
    config.get('amqp.password'),
    config.get('amqp.address'),
    config.get('amqp.port')
  ),
  mongodbURI: util.format(
    'mongodb://%s:%s/%s',
    config.get('mongodb.address'),
    config.get('mongodb.port'),
    config.get('mongodb.name')
  ),
});

// perform validation
config.validate()

module.exports = config
