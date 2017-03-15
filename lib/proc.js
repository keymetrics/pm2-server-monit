var pmx     = require('pmx');
var os = require('os');
var cp = require('child_process');

var metrics = {};
var Probe = pmx.probe();

function refreshMetrics() {
  cp.exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", { shell: true }, function(err, out) {
    if (err || !out) {
      if (os.platform() == 'darwin') {
        var nb = cp.execSync('ps -A').toString()
        nb = nb.split('\n')
        metrics.procRunning.set(nb.length - 1);
        return;
      }
      metrics.procRunning.set('❌');
      return;
    }
    var result_proc = (out.split('\n')).length-1;
    metrics.procRunning.set(result_proc);
  });

  cp.exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", { shell: true }, function(err, out, stderr) {
    if (err || stderr) {
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
