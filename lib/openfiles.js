var pmx     = require('pmx');
var fs = require('fs');

var probe = pmx.probe();
var metrics = {};

function refreshMetrics() {
  fs.readFile('/proc/sys/fs/file-nr', function(err, out) {
    if (err) {
      metrics.lsof.set('❌');
      return;
    }
    out = out.toString()
    var result = out.replace(/\n/g, "").split(' ')[0];
    result = parseInt(result);
    metrics.lsof.set(result);
  });
}

function initMetrics(conf) {
  metrics.lsof = probe.metric({
    name: 'Opened FD',
    value: 'N/A'
  });
}

function init(conf) {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics, conf.small_interval * 1000);
}

module.exports.init = init;
