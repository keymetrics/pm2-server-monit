var pmx     = require('pmx');
var probe   = pmx.probe();
var Netstat = require('./network');

var metrics = {};
var totalIn = 0, totalOut = 0, i = 0;

function startNetstat() {
  var netstat = new Netstat(1);

  netstat.start();

  netstat.on('stats', function (stats) {

    if (!metrics[stats.interface] && stats.interface != 'lo' && stats.outputBytes > 0) {
        metrics[stats.interface] = {};

        metrics[stats.interface]['input'] = probe.metric({
          name  : stats.interface + ' input',
          value : function() { return 0; }
        });

        metrics[stats.interface]['output'] = probe.metric({
          name  : stats.interface + ' output',
          value : function() { return 0; }
        });
      }

      console.log(stats.interface);
      if (metrics[stats.interface]) {
        metrics[stats.interface]['output'].set(((stats.outputBytes)/1048576).toFixed(2) + 'MB/s');
        metrics[stats.interface]['input'].set(((stats.inputBytes)/1048576).toFixed(2) + 'MB/s');

        totalIn += ((stats.inputBytes)/1048576);
        totalOut += ((stats.outputBytes)/1048576);
        i++;
        if (i == (Object.keys(metrics).length - 1)) {
          metrics.total.input.set(totalIn.toFixed(2) + 'MB/S');
          metrics.total.output.set(totalOut.toFixed(2) + 'MB/s');
          console.log(totalIn.toFixed(2) + 'MB/S');
          i = 0;
          totalIn = 0;
          totalOut = 0;
        }
      }


    // if (stats.interface != 'lo' && stats.outputBytes > 0) {
    //   metrics.output.set(((stats.outputBytes)/1048576).toFixed(2) + 'MB/s');
    //   metrics.input.set(((stats.inputBytes)/1048576).toFixed(2) + 'MB/s');
    // }
  });
}

function initMetrics() {
  metrics.total = {};
  metrics.total.input = probe.metric({
    name  : 'network in',
    value : function() { return 'N/A'; }
  });

  metrics.total.output = probe.metric({
    name  : 'network out',
    value : function() { return 'N/A'; }
  });
}

function init() {
  initMetrics();

  startNetstat();
}

module.exports.init = init;