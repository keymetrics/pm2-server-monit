var pmx     = require('pmx');
var shelljs = require('shelljs');

var probe = pmx.probe();
var metrics = {};
var REFRESH_RATE = 30000;

function refreshMetrics() {
  shelljs.exec('lsof -i -n -P | wc -l', { async : true, silent : true }, function(err, out) {
    if (err) {
      return pmx.notify('Fail: could not retrieve lsof metrics', err);
    }
    var result = out.replace(/\n/g, "");
    result = parseInt(result) - 1;
    metrics.lsof.set(result);
  });
}

function initMetrics() {
  metrics.lsof = probe.metric({
    name: 'Open files',
    value: 'N/A'
  });
}

function init() {
  initMetrics();
  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_RATE);
}

module.exports.init = init;