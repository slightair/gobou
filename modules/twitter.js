////
// reply tweet entry-content

var request = require('request');
var cheerio = require('cheerio');

exports.replyPattern = /https?:\/\/twitter.com(\/#!)?(\/([^\/]+)\/status(es)?\/\d+)/;

exports.reply = function(client, nick, to, result) {
  var pageURL = "https://mobile.twitter.com" + result[2];
  
  request.get({url : pageURL, encoding : null, headers : {"User-Agent" : "gobou"}}, function(err, response, body){
    if (err) {
      client.notice(to, 'ページ取得失敗…');
      return;
    }
    
    $ = cheerio.load(body, {lowerCaseTags:true, xmlMode:true});
    
    var screenName = result[3];
    var tweet = $("div#main-content div.tweet-text").text();
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
  });
}
