
var pmx     = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

(function firstLaunch() {
  var allProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err) {
      return console.error('Fail: could not retrieve process metrics', err);
    }
    var result_proc = (out.split('\n')).length-1;
    procRunning.set(result_proc);
  });

  var zombieProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err) {
      return console.error('Fail: could not retrieve process metrics', err);
    }
    var result_zombie = (out.split('\n')).length-1;
    procZombie.set(result_zombie);
  });
  setTimeout(firstLaunch, 30000);
})();

/*var netIn = shelljs.exec('while true";" do X=$Y";" sleep 1";" Y=$(ifconfig eth0|grep RX\ bytes|awk '{ print $2 }'|cut -d : -f 2)";" echo '$(( Y-X )) bps'";" done', { async : true, silent:true}, function(err, out) {
   console.log(out);
});*/

var procRunning = Probe.metric({
  name  : 'Total Processes',
  value : function() { return 'N/A'; }
});

var procZombie = Probe.metric({
  name  : 'Zombie processes',
  value : function() { return 'N/A'; },
  alert : {
    mode : 'threshold-avg',
    value : 10,
    msg : 'More than 10 zombies processes have been detected',
    cmp : '>'
  }
});
