var pmx     = require('pmx');
var child_process = require('child_process')

var Probe = pmx.probe();
var metrics = {};


function refreshMetrics() {

  var usedMemProc = child_process.exec('who | grep -v localhost | wc -l', { shell: true }, function(err, stdout, stderr) {
    if (err || stderr) {
      metrics.usersConnected.set('❌');
    }
    metrics.usersConnected.set(stdout);
  });
}

function initMetrics() {
  metrics.usersConnected = Probe.metric({
    name  : 'TTY/SSH opened',
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 15,
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
