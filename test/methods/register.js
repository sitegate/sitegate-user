'use strict'
const expect = require('chai').expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const registerPlugin = require('../../app/methods/register')

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

function sendVerificationEmail(server, opts, next) {
  server.method({
    name: 'sendVerificationEmail',
    handler(params, cb) {
      cb()
    },
  })

  next()
}

sendVerificationEmail.attributes = {
  name: 'send-verification-email',
}

describe('register', function() {
  beforeEach(mongotest.prepareDb(MONGO_URI));
  afterEach(mongotest.disconnect());

  it('should register user', function() {
    let server = new jimbo.Server()

    server.connection({
      channel: 'sitegate-user',
      url: 'amqp://guest:guest@localhost:5672',
    })

    return server
      .register([
        {
          register: require('../../models'),
          options: {
            mongoURI: MONGO_URI,
          },
        },
        {
          register: sendVerificationEmail,
        },
        {
          register: registerPlugin,
        },
      ])
      .then(() => {
        return server.methods
          .register({
            username: 'john.doe',
            email: 'some.email@gmail.com',
            password: 'qwerty',
            provider: 'local',
            displayName: 'John Doe',
            emailVerified: false,
          })
          .then(user => {
            expect(user).to.exist
          })
      })
  })
})
