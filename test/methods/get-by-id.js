'use strict'
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
const expect = chai.expect
const mongotest = require('./mongotest')
const jimbo = require('jimbo')
const modelsPlugin = require('../../models')
const helpers = require('./helpers')
const getById = require('../../app/methods/get-by-id')
const R = require('ramda')

chai.use(chaiAsPromised)

const MONGO_URI = 'mongodb://localhost/sitegate-user-tests'

let fakeUser = {
  username: 'sherlock',
  email: 'sherlock@holmes.uk',
  password: '123456',
  provider: 'local',
}

describe('getById', function() {
  let server

  beforeEach(mongotest.prepareDb(MONGO_URI));
  beforeEach(function() {
    server = jimbo()

    server.register([
      {
        register: modelsPlugin,
        options: {
          mongoURI: MONGO_URI,
        },
      },
    ])
  })
  afterEach(mongotest.disconnect());

  it('should get existing user by id', function() {
    return server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: getById,
        },
      ])
      .then(() => server.methods.getById({
        id: server.fakeUser.id,
      }))
      .then(user => {
        expect(user).to.exist
        expect(user.id).to.exist
      })
  })

  it('should not return user if there is no one', function(done) {
    let result = server
      .register([
        {
          register: helpers.userCreator(fakeUser),
        },
        {
          register: getById,
        },
      ])
      .then(() => server.methods.getById({
        id: '507f191e810c19729de860ea',
      }))

    expect(result).to.be.rejectedWith(Error, 'User not found').notify(done)
  })
})
