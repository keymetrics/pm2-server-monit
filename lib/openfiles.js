var pmx     = require('pmx');
var shelljs = require('shelljs');

var probe = pmx.probe();
var metrics = {};
var REFRESH_RATE = 30000;

function refreshMetrics() {
  shelljs.exec('cat /proc/sys/fs/file-nr', { async : true, silent : true }, function(err, out) {
    if (err) {
      return pmx.notify('Fail: could not retrieve lsof metrics', err);
    }
    var result = out.replace(/\n/g, "").split(' ')[0];
    result = parseInt(result);
    metrics.lsof.set(result);
  });
}

function initMetrics() {
  metrics.lsof = probe.metric({
    name: 'Opened FD',
    value: 'N/A'
  });
}

function init() {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_RATE);
}

module.exports.init = init;
