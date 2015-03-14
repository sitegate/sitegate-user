var config = require('./config/config');
var User = require('./models/user');

var rpc = require('amqp-rpc').factory({
    url: config.amqpURL
});

rpc.on('user.getById', function (params, cb) {
  console.log('Called user.getById with id ' + params.id);
  User.findById(params.id, cb);
});

rpc.on('user.update', function (params, cb) {
  console.log('Called update');
  
  User.findById(params.id, function (err, user) {
    if (err || !user) {
      return cb(err, user);
    }
    
    user.username = params.username || user.username;

    var newEmail = params.email ? params.email.toLowerCase() : null;
    var emailHasBeenUpdated = newEmail && (newEmail !== user.email);

    user.email = newEmail;
    if (emailHasBeenUpdated) {
      user.emailVerified = false;
    }
    
    user.save(cb);
  });
});