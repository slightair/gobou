////
// reply tweet entry-content

var jsdom = require('jsdom');
var fs = require('fs');
var jQueryPath = LIBRARY_PATH + 'jquery-1.6.1.min.js';
var jQuery = fs.readFileSync(jQueryPath).toString();

exports.replyPattern = /https?:\/\/twitter.com(\/#!)?(\/[^\/]+\/status(es)?\/\d+)/;

exports.reply = function(client, nick, to, result) {
  jsdom.env({
    html: "https://mobile.twitter.com" + result[2],
    src: [jQuery],
    done: function(error, window) {
      var screenName = window.$.trim(window.$("span.username:first").text());
      var tweet = window.$("div#main-content div.tweet-text").text();
      var lines = tweet.split("\n");
      if (lines.length > 1) {
          client.notice(to, screenName + ":");
          lines.forEach(function(line){
              if (line == '') line = ' ';
              client.notice(to, line);
          });
      }
      else {
          client.notice(to, screenName + ": " + tweet);
      }
    }
  });
}
