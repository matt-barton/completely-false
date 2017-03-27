var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  denodeify = rsvp.denodeify,
  secret = require('./secret');

var t = new twitter(secret);

uploadCaine()
  .then(startSearch)
  .catch(errorHandler);

function uploadCaine() {
  var caine = fs.readFileSync('./completelyfalse.jpg');
  return t.post('media/upload', { media: caine });
}

function errorHandler(e) {
  console.error(e.stack);
}

function startSearch(media) {
  var stream = t.stream('statuses/filter', {track: 'completely false'});

  stream.on('data', tweetReply);
  stream.on('error', function(error) {
    throw error;
  });

  function tweetReply(tweet) {
  	var userAt = tweet.user.screen_name;
  	console.log('@' + userAt);
  	if (userAt !== 'MattBarton_') return rsvp.Promise.resolve();

    var status = {
      status: '@' + userAt,
      media_ids: media.media_id_string,
      in_reply_to_status_id: tweet.id_str
    }

    return t.post('statuses/update', status);
  }
}

