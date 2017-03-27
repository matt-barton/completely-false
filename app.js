var twitter = require('twitter'),
  fs = require('fs'),
  rsvp = require('rsvp'),
  denodeify = rsvp.denodeify;

var secret = {
  consumer_key: 'OGDvXyIoJsiJUowgkbS9DrkUz',
  consumer_secret: 'ZnKCumRPvNe7dkv4TulRgAun578nRyKRmbURMyA53s0nSG9I2y',
  access_token_key: '846354299395457025-3cQuG4wrWirwVrwPirtK3nahWUQN9Kt',
  access_token_secret: 'Pxe0R1T8uxoI7xQij3EOEZ0iohbiSMUglyFap8MQyXG1l'
};

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
  	if (userAt !== 'MattBarton_') return rsvp.Promise.resolve();

    var status = {
      status: '@' + userAt,
      media_ids: media.media_id_string,
      in_reply_to_status_id: tweet.id_str
    }

    return t.post('statuses/update', status);
  }
}

