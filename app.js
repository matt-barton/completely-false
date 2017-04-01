var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  denodeify = rsvp.denodeify,
  secret = require('./secret');

var t = new twitter(secret);
var dev = process.env.NODE_ENV === 'development';

start();

function start() {
  heartbeat()
    .then(uploadCaine)
    .then(startSearch)
    .catch(errorHandler);
  }

function heartbeat () {
  setTimeout(heartbeat, 1000 * 60 * 20);
  return t.post('statuses/update', { status: randomStatus() });
}

function uploadCaine() {
  var caine = fs.readFileSync('./completelyfalse.jpg');
  return t.post('media/upload', { media: caine });
}

function errorHandler(e) {
  console.error(e.stack || e);
  start();
}

function startSearch(media) {
  t.stream('statuses/filter', { track: 'completely false' })
    .on('data', tweetReply)
    .on('error', errorHandler);

  console.log('Searching ...');

  function tweetReply(tweet) {
  	var userAt = tweet.user.screen_name;
  	var regex = /completely false/i;

  	if (!regex.test(tweet.text)) return rsvp.Promise.resolve();
  	if (tweet.retweeted_status) return rsvp.Promise.resolve();
  	
    var status = {
      status: '@' + userAt,
      media_ids: media.media_id_string,
      in_reply_to_status_id: tweet.id_str,
      in_reply_to_screen_name: tweet.user.screen_name
    }

    return t.post('statuses/update', status)
      .then(logTweet)
      .catch(errorHandler);
  }

  function logTweet (tweet) {
    console.log(tweet);
  }
}

function randomStatus () {

  var statuses = [
    'Locked in attick',
    'Completely false',
    'Please excuse repetitive posts from this account, I have to post boring things every now and again, because of Twitter Rules',
    'Please give blood regularly, if you can. Call 0300 123 2323 for an appointment. @GiveBloodNHS',
    'You could save someone\'s life. Become a stem cell donor. @DKMS_uk',
    'Support the arts. Without art, what\'s the point? @artsemergency'
  ];

  return statuses[Math.floor(Math.random() * (statuses.length))];
}