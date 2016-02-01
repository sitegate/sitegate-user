'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getByUsername = require('../../app/methods/get-by-username')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('getByUsername', function() {
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
    ])
  })
  afterEach(mongotest.disconnect());

  it('should get existing user by username', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: getByUsername,
        },
      ])
      .then(() => server.methods.getByUsername({
        username: server.fakeUser.username,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should not return user if there is no one', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: getByUsername,
        },
      ])
      .then(() => server.methods.getByUsername({
        username: 'not-exists',
      }))
      .then(user => {
        expect(user).to.not.exist
      })
  })
})
