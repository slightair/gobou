// modules
var fs = require('fs');

TMP_PATH = "./tmp/"
LIBRARY_PATH = "./lib/"
MODULE_PATH = "./modules/"

var DummyClient = function() {}
DummyClient.prototype.notice = function (target, text) {
  console.log(text);
}

var loadModule = function(moduleName) {
  var modulePathBase = MODULE_PATH + moduleName;
  var time = new Date().getTime();
  var srcPath = modulePathBase + ".js";
  var dstPath = TMP_PATH + moduleName + time;
    
  fs.linkSync(srcPath, dstPath);
  var module = require(dstPath);
  fs.unlinkSync(dstPath);
    
  return module
}

var showUsage = function() {
  console.log("Usage: node test_module.js [modulename] [text]");
}

var moduleName = process.argv[2];
var text = process.argv[3];

if (!moduleName) {
  showUsage();
  process.exit(1);
};

if (!text) {
  showUsage();
  process.exit(1);
}

var module = loadModule(moduleName);
var result = text.match(module.replyPattern);
var client = new DummyClient()

if (result) {
  module.reply.call(null, client, "nick", "#test", result);
}
