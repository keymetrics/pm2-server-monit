var pmx = require('pmx');
var Probe = pmx.probe();

var lib = require('./lib');

var Netstat = require('./network');

var netstat = new Netstat(1);

netstat.start();

var networkMetrics = {};

netstat.on('stats', function (stats) {

  if (!networkMetrics[stats.interface] && stats.interface != 'lo' && stats.outputBytes > 0) {
    networkMetrics[stats.interface] = {};

    networkMetrics[stats.interface]['input'] = Probe.metric({
      name  : stats.interface + ' input',
      value : function() { return 0; }
    });

    networkMetrics[stats.interface]['output'] = Probe.metric({
      name  : stats.interface + ' output',
      value : function() { return 0; }
    });
  }

  if (networkMetrics[stats.interface]) {
    networkMetrics[stats.interface]['output'].set(((stats.outputBytes)/1048576).toFixed(2) + 'MB/s');
    networkMetrics[stats.interface]['input'].set(((stats.inputBytes)/1048576).toFixed(2) + 'MB/s');
  }

});
