'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const trustsClient = require('../../app/methods/trusts-client')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('trustsClient', function() {
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

  it('should return true if user trusts the client', function() {
    let trustedClientId = '507f191e810c19929de860ea'
    return server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: [trustedClientId],
          })),
        },
        {
          register: trustsClient,
        },
      ])
      .then(() => server.methods.trustsClient({
        userId: server.fakeUser.id,
        clientId: trustedClientId,
      }))
      .then(trusts => {
        expect(trusts).to.be.true
      })
  })

  it('should return false if user doesn\'t trust the client', function() {
    return server
      .register([
        {
          register: helpers.userCreator(R.merge(fakeUser, {
            trustedClients: ['507f191e810c19929de860eb'],
          })),
        },
        {
          register: trustsClient,
        },
      ])
      .then(() => server.methods.trustsClient({
        userId: server.fakeUser.id,
        clientId: '507f191e810c19929de860ea',
      }))
      .then(trusts => {
        expect(trusts).to.be.false
      })
  })
})
