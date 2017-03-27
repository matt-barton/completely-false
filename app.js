var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  denodeify = rsvp.denodeify,
  secret = require('./secret');

var t = new twitter(secret);
var dev = process.env.NODE_ENV === 'development';

uploadCaine()
  .then(startSearch)
  .catch(errorHandler);

function uploadCaine() {
  var caine = fs.readFileSync('./completelyfalse.jpg');
  return t.post('media/upload', { media: caine });
}

function errorHandler(e) {
  console.log('in error handler');
  console.error(e);
  console.error(e.stack);
}

function startSearch(media) {
  t.stream('statuses/filter', {track: 'completely false'})
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

console.log(status);

    return t.post('statuses/update', status)
      .then(logTweet)
      .catch(errorHandler);
  }

  function logTweet (e, tweet) {
    console.log('in log tweet');
    console.log(e);
    console.log(tweet);

  }
}

