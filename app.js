var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  denodeify = rsvp.denodeify,
  secret = require('./secret');

var t = new twitter(secret), fails = 0;
var dev = process.env.NODE_ENV === 'development';

start();

function start() {
  uploadCaine()
    .then(startSearch)
    .catch(errorHandler);
  }
function uploadCaine() {
  var caine = fs.readFileSync('./completelyfalse.jpg');
  return t.post('media/upload', { media: caine });
}

function errorHandler(e) {
  console.error(e.stack || e);
  if (++fails < 10) start();
}

function startSearch (media) {
  t.stream('statuses/filter', { track: 'completely false' })
    .on('data', tweetReply)
    .on('error', errorHandler);

  console.log('Searching ...');

  function tweetReply(tweet) {

    if (tweet.retweeted_status) return rsvp.Promise.resolve(); // exit if it's a retweet

    var userAt = tweet.user.screen_name;
    if (userAt === 'C0mpletelyFalse') return rsvp.Promise.resolve(); // exit if I sent it myself

  	var regex = /completely false/i;
  	if (!regex.test(tweet.text)) return rsvp.Promise.resolve(); // exit if it doesn't conatain the exact phrase 
    	
    return buildStatus()
      .then(postStatus)
      .then(logTweet)
      .catch(errorHandler);

    function buildStatus () {
      return rsvp.Promise.resolve(Math.random() < 0.25 ? {
        status: '@' + userAt,
        media_ids: media.media_id_string,
        in_reply_to_status_id: tweet.id_str,
        in_reply_to_screen_name: tweet.user.screen_name
      } : {
        status: '"Completely false." https://twitter.com/' + userAt + '/status/' + tweet.id_str,
      });
    }

    function postStatus (status) {
      return t.post('statuses/update', status);
    }

    function logTweet () {
      console.log((tweet.user.verified ? '*** ' : '') + '@' + userAt);
    }
  };

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