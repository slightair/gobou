////
// reply page title

var request = require('request');
var cheerio = require('cheerio');
var CharsetMatch = require('node-icu-charset-detector').CharsetMatch;
var Iconv = require('iconv').Iconv;

var excludeURLPatterns = [
  /https?:\/\/twitter.com(\/#!)?(\/[^\/]+\/status(es)?\/\d+)/,
  /https?:\/\/(localhost|127.0.0.\d{1,3}).*/
]

exports.replyPattern = /https?:\/\/([a-z0-9\-.]+)[^\s]+/;

exports.reply = function(client, nick, to, result) {
  var pageURL = result[0];

  for (var i=0;i<excludeURLPatterns.length;i++) {
    var pattern = excludeURLPatterns[i];
    if (pageURL.match(pattern)) {
      return;
    }
  }

  request.get({url : pageURL, encoding : null, headers : {"User-Agent" : "gobou"}}, function(err, response, body){
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
      $ = cheerio.load(body, {lowerCaseTags:true, xmlMode:true});
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

    if (charset.toLowerCase() == "windows-31j" || charset.toLowerCase() == "x-sjis") {
      charset = "CP932";
    }

    try {
      converter = new Iconv(charset, 'UTF-8//TRANSLIT//IGNORE');
      body = converter.convert(new Buffer(body, 'binary')).toString();
    }
    catch(e) {
      // 文字コード変換を行わずそのまま表示する。(文字化けする可能性がある)
    }

    $ = cheerio.load(body, {lowerCaseTags:true, xmlMode:true});

    var pageTitle = $('title').text();
    pageTitle = pageTitle.replace(/\r|\n/g, "");
    pageTitle = pageTitle.replace(/\s+/g, " ");

    if (pageTitle.match(/^\s*(.+)\s*$/)) {
      pageTitle = RegExp.$1;
    }

    client.notice(to, "title: " + pageTitle);
  });
}
