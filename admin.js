var _ = require('underscore'),
  twitter = require('twitter'),
  rsvp = require('rsvp'),
  config = require('./config'),
  secret = require('./secret'),
  t = new twitter(secret);

module.exports = {
  setup: setup
};

function setup() {
  config.admins.push(config.owner);
  return new rsvp.Promise(function (resolve) {
    t.stream('user', { with: 'user' })
      .on('data', consumeDM);
    console.log('Admin console running');
    return resolve();
  });
}

function consumeDM(message) {
  if (!message.direct_message) return; // message is not a dm
  var dm = message.direct_message;
  if (!_(config.admins).contains(dm.sender.screen_name)) return; // dm is not from an admin
  if (actions[dm.text]) actions[dm.text](dm);
}

var actions = {
  'status': status,
  'stop': stop,
  'resume': start,
  'help': help
};

function status (dm) {
  respond(dm.sender.screen_name, config.active() ? 'up' : 'down');
}

function stop (dm) {
  config.deactivate();
  console.log(config.active());
  respondOk(dm);
}

function start (dm) {
  config.activate();
  console.log(config.active());
  respondOk(dm);
}

function respondOk (dm) {
  respond(dm.sender.screen_name, 'ok');
}

function respond (user, message) {
  t.post('direct_messages/new', {
    text: message,
    screen_name: user
  });
}

function help (dm) {
	respond(dm.sender.screen_name, _(actions).keys().join(' | '));
}