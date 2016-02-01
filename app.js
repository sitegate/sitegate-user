'use strict'
const config = require('./config')
const jimbo = require('jimbo')

let server = jimbo()

server.connection({
  channel: 'sitegate-user',
  amqpURL: config.get('amqpURI'),
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
    register: require('./app/methods/change-password'),
  },
  {
    register: require('./app/methods/change-password-using-token'),
  },
  {
    register: require('./app/methods/disconnect-provider'),
  },
  {
    register: require('./app/methods/get-by-id'),
  },
  {
    register: require('./app/methods/get-by-username'),
  },
  {
    register: require('./app/methods/get-trusted-clients'),
  },
  {
    register: require('./app/methods/query'),
  },
  {
    register: require('./app/methods/register'),
  },
  {
    register: require('./app/methods/request-password-change-by-email'),
  },
  {
    register: require('./app/methods/revoke-all-clients-access'),
  },
  {
    register: require('./app/methods/save-oauth-user-profile'),
  },
  {
    register: require('./app/methods/send-verification-email'),
  },
  {
    register: require('./app/methods/trust-client'),
  },
  {
    register: require('./app/methods/trusts-client'),
  },
  {
    register: require('./app/methods/update'),
  },
  {
    register: require('./app/methods/validate-reset-token'),
  },
  {
    register: require('./app/methods/verify-email-by-token'),
  },
])
.then(() => server.start())
.then(() => console.log('Service started'))
.catch(err => console.error(err))
