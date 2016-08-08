var pmx     = require('pmx');
var shelljs = require('shelljs');

var metrics = {};
var Probe = pmx.probe();
var REFRESH_RATE = 30000;

function refreshMetrics() {
  var allProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err) {
      return pmx.notify('Fail: could not retrieve process metrics', err);
    }
    var result_proc = (out.split('\n')).length-1;
    metrics.procRunning.set(result_proc);
  });

  var zombieProc = shelljs.exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", { async : true, silent:true}, function(err, out) {
    if (err) {
      return pmx.notify('Fail: could not retrieve process metrics', err);
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

function init() {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_RATE);
}

module.exports.init = init;
