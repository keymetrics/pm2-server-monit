var pmx     = require('pmx');
var probe   = pmx.probe();
var Netstat = require('./network');

var metrics = {};

function startNetstat() {
  var netstat = new Netstat(1);

  netstat.start();

  netstat.on('stats', function (stats) {
    if (stats.interface != 'lo' && stats.outputBytes > 0) {
      metrics.output.set(((stats.outputBytes)/1048576).toFixed(2) + 'MB/s');
      metrics.input.set(((stats.inputBytes)/1048576).toFixed(2) + 'MB/s');
    }
  });
}

function initMetrics() {
  metrics.input = probe.metric({
    name  : 'network in',
    value : function() { return 'N/A'; }
  });

  metrics.output = probe.metric({
    name  : 'network out',
    value : function() { return 'N/A'; }
  });
}

function init() {
  initMetrics();

  startNetstat();
}

module.exports.init = init;