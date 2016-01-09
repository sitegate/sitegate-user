'use strict'
const config = require('./config')
const jimbo = require('jimbo')

let server = new jimbo.Server()

server.connection({
  channel: 'sitegate-user',
  url: config.get('amqpURI'),
})

server.register([
  {
    register: require('jimbo-client'),
  },
  {
    register: require('./models'),
    options: {
      mongoURI: config.get('mongodbURI'),
    },
  },
  {
    register: require('./clients/mailer'),
    options: {
      amqpURL: config.get('amqpURI'),
    },
  },
  {
    register: require('./clients/client'),
    options: {
      amqpURL: config.get('amqpURI'),
    },
  },
  {
    register: require('./app/methods/authenticate'),
  },
  {
    register: require('./app/methods/changePassword'),
  },
  {
    register: require('./app/methods/changePasswordUsingToken'),
  },
  {
    register: require('./app/methods/disconnectProvider'),
  },
  {
    register: require('./app/methods/getById'),
  },
  {
    register: require('./app/methods/getByUsername'),
  },
  {
    register: require('./app/methods/getTrustedClients'),
  },
  {
    register: require('./app/methods/query'),
  },
  {
    register: require('./app/methods/register'),
  },
  {
    register: require('./app/methods/requestPasswordChangeByEmail'),
  },
  {
    register: require('./app/methods/revokeAllClientsAccess'),
  },
  {
    register: require('./app/methods/saveOAuthUserProfile'),
  },
  {
    register: require('./app/methods/sendVerificationEmail'),
  },
  {
    register: require('./app/methods/trustClient'),
  },
  {
    register: require('./app/methods/trustsClient'),
  },
  {
    register: require('./app/methods/update'),
  },
  {
    register: require('./app/methods/validateResetToken'),
  },
  {
    register: require('./app/methods/verifyEmailByToken'),
  },
], err => {
  if (err) throw err

  server.start(() => console.log('Service started'))
})
