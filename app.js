'use strict'

const jimbo = require('jimbo')

let server = new jimbo.Server()

server.connection({
  url: '',
})

server.register([
  {
    register: require('./models'),
    options: {
      mongoURI: '',
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
