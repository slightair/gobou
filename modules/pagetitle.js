////
// reply page title

var request = require('request');
var cheerio = require('cheerio');
var CharsetMatch = require('node-icu-charset-detector').CharsetMatch;
var Iconv = require('iconv').Iconv;

var excludeURLPatterns = [
  /https?:\/\/twitter.com(\/#!)?(\/[^\/]+\/status(es)?\/\d+)/
]

exports.replyPattern = /https?:\/\/([a-z0-9\-.]+)[a-zA-Z0-9\.$,;:&=?!*~@#_\(\)\/\-%+]+/;

exports.reply = function(client, nick, to, result) {
  var pageURL = result[0];
  
  for (var i=0;i<excludeURLPatterns.length;i++) {
    var pattern = excludeURLPatterns[i];
    if (pageURL.match(pattern)) {
      return;
    }
  }
  
  request.get({url : pageURL, encoding : null}, function(err, response, body){
    if (err) {
      client.notice(to, 'ページ取得失敗…');
      return;
    }
    
    var charset;
    
    // response header
    var contentType = response.headers['content-type'];
    if (contentType == undefined) {
      client.notice(to, 'Content-Type 取得失敗…');
      return;
    }
    
    if (contentType.match(/^text\/html/) == null) {
      return;
    }
    
    if (contentType.match(/charset=(.+)$/)) {
      charset = RegExp.$1;
    }
    
    // meta tag
    if (charset == undefined) {
      $ = cheerio.load(body);
      charset = $('meta[charset]').attr('charset');
      
      if (charset == undefined) {
        var metaContentType = $('meta[http-equiv="Content-Type"]').attr('content');
        if (metaContentType != undefined && metaContentType.match(/charset=(.+)$/)) {
          charset = RegExp.$1;
        }
      }
    }
    
    // icu
    if (charset == undefined) {
      var buffer = new Buffer(body, 'binary');
      var charsetMatch = new CharsetMatch(buffer);
      charset = charsetMatch.getName();
    }
    
    if (charset == undefined) {
      client.notice(to, 'タイトル取得失敗…');
      return;
    }
    
    converter = new Iconv(charset, 'UTF-8//TRANSLIT//IGNORE');
    body = converter.convert(new Buffer(body, 'binary')).toString();
    $ = cheerio.load(body);
    
    var pageTitle = $('title').text();
    
    client.notice(to, "title: " + pageTitle);
  });
}
