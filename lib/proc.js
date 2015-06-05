
var pmx     = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

setInterval(function () {
	
	var allProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", { async : true, silent:true}, function(err, out) {
	  var result_proc = (out.split('\n')).length-1;
	  procRunning.set(result_proc);
	});

}, 1000)

setInterval(function () {
	
	var zombieProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", { async : true, silent:true}, function(err, out) {
	  var result_zombie = (out.split('\n')).length-1;
	  procZombie.set(result_zombie);
	});

}, 1000)

/*var netIn = shelljs.exec('while true";" do X=$Y";" sleep 1";" Y=$(ifconfig eth0|grep RX\ bytes|awk '{ print $2 }'|cut -d : -f 2)";" echo '$(( Y-X )) bps'";" done', { async : true, silent:true}, function(err, out) {
	 console.log(out);
});*/

var procRunning = Probe.metric({
  name  : 'All processes',
  value : function() { return 'N/A'; }
});

var procZombie = Probe.metric({
  name  : 'Zombie processes',
  value : function() { return 'N/A'; }
});
