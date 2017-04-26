var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  secret = require('./secret');

var t = new twitter(secret), fails = 0;
var dev = process.env.NODE_ENV === 'development';

uploadCaine()
  .then(startSearch)
  .catch(errorHandler);

function uploadCaine() {
  var caine = fs.readFileSync('./completelyfalse.jpg');
  return t.post('media/upload', { media: caine });
}

function errorHandler(e) {
  console.error(e.stack || e);
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
    
    var blueTick = tweet.user.verified;

    return buildStatus()
      .then(postStatus)
      .then(logTweet)
      .catch(errorHandler);

    function buildStatus () {
      return rsvp.Promise.resolve(Math.random() < 0.25 || blueTick ? {
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
      console.log((blueTick ? '*** ' : '') + '@' + userAt);
    }
  };
}