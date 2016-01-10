'use strict'
const assert = require('assert')
const mongoose = require('mongoose')

function dropCollections(collections, index, cb) {
  if (typeof index === 'function') {
    cb = index
    index = 0
  }

  if (index < collections.length) {
    mongoose.connection.db.dropCollection(collections[index], err => {
      assert.ifError(err)

      dropCollections(collections, index + 1, cb)
    })
    return
  }

  cb()
}

exports.prepareDb = function(connectionString, options) {
  options = options || {};
  options.timeout = options.timeout || 5000;
  return function(cb) {
    this.timeout(options.timeout)

    mongoose.connect(connectionString, err => {
      assert.ifError(err)

      mongoose.connection.db.collections((err, collections) => {
        assert.ifError(err)

        let collectionsToDrop = collections
          .filter(col => col.collectionName.indexOf('system.') !== 0)
          .map(col => col.collectionName)

        dropCollections(collectionsToDrop, 0, cb)
      })
    })
  }
}

exports.disconnect = function() {
  return cb => mongoose.disconnect(cb)
}
