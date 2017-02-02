var pmx     = require('pmx');
var shelljs = require('shelljs');

var metrics = {};
var Probe = pmx.probe();

function refreshMetrics() {
  var allProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err || !out) {
      metrics.procRunning.set('❌');
      return;
    }
    var result_proc = (out.split('\n')).length-1;
    metrics.procRunning.set(result_proc);
  });

  var zombieProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err) {
      metrics.procZombie.set('❌');
      return;
    }
    var result_zombie = (out.split('\n')).length-1;
    metrics.procZombie.set(result_zombie);
  });
}

function initMetrics() {
  metrics.procRunning = Probe.metric({
    name  : 'Total Processes',
    value : 'N/A'
  });

  metrics.procZombie = Probe.metric({
    name  : 'Zombie processes',
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 10,
      cmp : '>'
    }
  });
}

function init(conf) {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics, conf.small_interval * 1000);
}

module.exports.init = init;
