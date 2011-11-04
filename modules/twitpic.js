////
// reply twitpic description

var jsdom = require('jsdom');
var fs = require('fs');
var jQueryPath = LIBRARY_PATH + 'jquery-1.6.1.min.js';
var jQuery = fs.readFileSync(jQueryPath).toString();

exports.replyPattern = /https?:\/\/twitpic.com(\/\w+)/;

exports.reply = function(client, nick, to, result) {
  jsdom.env({
    html: "http://twitpic.com" + result[1],
    src: [jQuery],
    done: function(error, window) {
      var screenName = window.$("a#photo_username").text();
      var tweet = window.$("div#view-photo-caption").text().replace(/^\s+|\s+$/g, "");
      var message = screenName + ": " + tweet;
      
      client.notice(to, message);
    }
  });
}
