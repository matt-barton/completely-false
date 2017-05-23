var config = require('./config'),
  twitter = require('twitter'),
  rsvp = require('rsvp'),
  secret = require('./secret'),
  t = new twitter(secret);

module.exports = {
  setup: setup
};

function setup() {
  return t.stream('user')
    .on('direct_message', consumeDM);
}

function consumeDM(message) {
  console.log(message);
}