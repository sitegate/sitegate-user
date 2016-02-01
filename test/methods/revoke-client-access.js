'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const revokeClientAccess = require('../../app/methods/revoke-client-access')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('revokeClientAccess', function() {
  let server

  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function() {
    server = jimbo()

    return server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: MONGO_URI,
        },
      },
      {
        register: getById,
      },
    ])
  })
  afterEach(mongotest.disconnect());

  it('should revoke client access if it is trusted by the user', function() {
    let trustedClientId = '507f191e810c19929de860ea'
    return server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: [trustedClientId],
          })),
        },
        {
          register: revokeClientAccess,
        },
      ])
      .then(() => server.methods.revokeClientAccess({
        userId: server.fakeUser.id,
        clientId: trustedClientId,
      }))
      .then(user => {
        expect(user.trustedClients.length).to.eq(0)
      })
  })

  it('should throw error if trying to revoke access from client that is not trusted', function(done) {
    let trustedClientId = '507f191e810c19929de860ea'
    let result = server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: [],
          })),
        },
        {
          register: revokeClientAccess,
        },
      ])
      .then(() => server.methods.revokeClientAccess({
        userId: server.fakeUser.id,
        clientId: trustedClientId,
      }))

    expect(result).to.be.rejectedWith(Error).notify(done)
  })
})
