
var pmx     = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

(function firstLaunch() {

  var usedMemProc = shelljs.exec('who | grep -v localhost | wc -l', { async : true, silent:true}, function(err, out) {

    var users_connected = out;
    usersConnected.set(users_connected);

  });
  setTimeout(firstLaunch, 10000);
})();


var usersConnected = Probe.metric({
  name  : 'TTY/SSH opened',
  value : function() { return 'N/A'; }
});
