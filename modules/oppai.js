////
// reply excellent url

exports.replyPattern = /^(oppai|おっぱい)$/;

exports.reply = function(client, nick, to, result) {
  var message = "http://slightair.tumblr.com/";
  client.notice(to, message);
}
