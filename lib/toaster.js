(function(){
  var dir, regex, ref$, watch, exists, readdir, exec, fromEvent, Tail, lines, clean, notify, start;
  if (process.argv.length !== 4) {
    console.error('not enough arguments! need a directory to look at and a regex to filter by.');
    process.exit();
  }
  dir = process.argv[2];
  regex = new RegExp(process.argv[3], 'i');
  ref$ = require('fs'), watch = ref$.watch, exists = ref$.exists, readdir = ref$.readdir;
  exec = require('child_process').exec;
  fromEvent = require('rx').Observable.fromEvent;
  Tail = require('tail').Tail;
  lines = function(filename){
    var tailer;
    tailer = new Tail(dir + '/' + filename);
    return fromEvent(tailer, 'line');
  };
  clean = function(str){
    return str.replace(/'/g, "\\'");
  };
  notify = function(title, message){
    return exec("terminal-notifier -title '" + clean(title) + "' -message '" + clean(message) + "'", function(){});
  };
  start = function(filename){
    var room, ref$, ref1$;
    room = (ref$ = (ref1$ = /#[^.]+/.exec(filename)) != null ? ref1$[0] : void 8) != null ? ref$ : 'unknown';
    lines(filename).map(function(it){
      return it.split(/\t/g);
    }).filter(function(it){
      var ref$;
      return (ref$ = it[1]) !== '--' && ref$ !== '<--' && ref$ !== '-->';
    }).map(function(it){
      return it[2];
    }).filter(function(it){
      return it.match(regex);
    }).bufferWithTime(250).map(function(it){
      switch (false) {
      case !(it.length > 4):
        return [it.length + " mentions"];
      default:
        return it;
      }
    }).subscribe(function(it){
      var i$, len$, mention;
      for (i$ = 0, len$ = it.length; i$ < len$; ++i$) {
        mention = it[i$];
        notify("IRC Mention: " + room, mention);
      }
    });
  };
  readdir(dir, function(_, names){
    var i$, len$, name;
    for (i$ = 0, len$ = names.length; i$ < len$; ++i$) {
      name = names[i$];
      start(name);
    }
  });
  watch(dir, function(_, name){
    exists(name, function(present){
      if (present === true) {
        start(name);
      }
    });
  });
}).call(this);
