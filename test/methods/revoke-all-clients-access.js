'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const revokeAllClientsAccess = require('../../app/methods/revoke-all-clients-access')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('revokeAllClientsAccess', function() {
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

  it('should revoke all clients access of a user', function() {
    return server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: [
              '507f191e810c19929de860ea',
              '507f191e810c19929de860eb',
            ],
          })),
        },
        {
          register: revokeAllClientsAccess,
        },
      ])
      .then(() => server.methods.revokeAllClientsAccess({
        userId: server.fakeUser.id,
      }))
      .then(user => {
        expect(user.trustedClients.length).to.eq(0)
      })
  })
})
