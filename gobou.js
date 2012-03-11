// modules
var fs = require('fs');
var irc = require('irc');
var configFile = './config.json';

TMP_PATH = "./tmp/"
LIBRARY_PATH = "./lib/"
MODULE_PATH = "./modules/"

// Gobou
Gobou = function() {
  var config;
  var client;
  var modules;
}

Gobou.prototype.loadConfig = function(filePath, callback) {
  var gobou = this;
  fs.readFile(filePath, 'utf8', function(error, data){
      if (error) {
        throw error;
      }
      gobou.config = JSON.parse(data);
      gobou.loadModules();
      
      console.log("loadConfig");
      if (callback) {
        callback.call();
      }
  });
}

Gobou.prototype.loadModules = function() {
  var gobou = this;
  var modules = {};
  for (var i=0;i<gobou.config.modules.length;i++) {
    var moduleName = gobou.config.modules[i];
    var modulePathBase = MODULE_PATH + moduleName;
    var time = new Date().getTime();
    var srcPath = modulePathBase + ".js";
    var dstPath = TMP_PATH + moduleName + time;
    
    fs.linkSync(srcPath, dstPath);
    modules[moduleName] = require(dstPath);
    fs.unlinkSync(dstPath);
  }
  gobou.modules = modules;
}

Gobou.prototype.eventMessage = function(gobou, nick, to, text) {
  for (var i=0;i<gobou.config.modules.length;i++) {
    var moduleName = gobou.config.modules[i];
    var module = gobou.modules[moduleName];
    var result = text.match(module.replyPattern);
    
    if (result) {
      module.reply.call(null, gobou.client, nick, to, result);
    }
  }
}

Gobou.prototype.start = function(configFile) {
  var gobou = this;
  
  gobou.loadConfig(configFile, function() {
    var options = gobou.config['options'];
    options['autoConnect'] = false;
    var client = new irc.Client(gobou.config['server'], gobou.config['nick'], options);
    gobou.client = client;
    
    // events
    client.addListener('message', function(nick, to, text) {
      gobou.eventMessage(gobou, nick, to, text);
    });
    
    client.connect();
  });
  
  // watch config file.
  fs.watchFile(configFile, function(current, prev) {
    if(current.mtime > prev.mtime) {
      gobou.loadConfig(configFile, null);
    }
  });
}

var gobou = new Gobou();
gobou.start(configFile);