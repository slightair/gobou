////
// reply tweet entry-content

var jsdom = require('jsdom');
var fs = require('fs');
var jQueryPath = LIBRARY_PATH + 'jquery-1.6.1.min.js';
var jQuery = fs.readFileSync(jQueryPath).toString();

exports.replyPattern = /https?:\/\/twitter.com(\/#!)?(\/[^\/]+\/status\/\d+)/;

exports.reply = function(client, nick, to, result) {
  jsdom.env({
    html: "http://twitter.com" + result[2],
    src: [jQuery],
    done: function(error, window) {
      var screenName = "@" + window.$("a.screen-name").text();
      var tweet = window.$("span.entry-content").text();
      var message = screenName + ": " + tweet;
      
      client.notice(to, message);
    }
  });
}
