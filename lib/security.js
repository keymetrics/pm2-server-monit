var pmx     = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

var sec = Probe.metric({
  name  : 'Security pckg',
  value : function() { return 'N/A'; }
});

var child = shelljs.exec('/usr/lib/update-notifier/apt-check 2>&1 | cut -d ";" -f 2', { async : true, silent:true}, function(err, out) {
  sec.set(parseInt(out));
});