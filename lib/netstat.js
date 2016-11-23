var pmx     = require('pmx');
var probe   = pmx.probe();
var shelljs = require('shelljs');

var metrics = {};
var oldStats = [];

function refreshNet(interval) {
  shelljs.exec('ip -s link', { async : true, silent : true }, function(err, out) {
    if (err)
      throw new Error('ip -s a failed to execute');
    var names = new RegExp(/[1-9]+: ([\S]+): /g);
    var RX = new RegExp(/    RX: bytes  packets  errors  dropped overrun mcast\s*\n\s*([0-9]+) /gm);
    var TX = new RegExp(/    TX: bytes  packets  errors  dropped carrier collsns \s*\n\s*([0-9]+) /g);

  	var stats = [];
  	var i = 0, totalIn = 0, totalOut = 0;

    while ((res = names.exec(out)) !== null) {
      stats[i++] = {
        interface: res[1]
      };
    }

    var i = 0;
    while((res= RX.exec(out)) !== null) {
      stats[i++].inputBytes = res[1];
    }
    var i = 0;
    while((res= TX.exec(out)) !== null) {
      stats[i++].outputBytes = res[1];
    }

    for (var i = 0; i < stats.length; i++) {
      if (!metrics[stats[i].interface] && stats[i].interface != 'lo' && stats[i].outputBytes > 0) {
        metrics[stats[i].interface] = {};

        metrics[stats[i].interface]['input'] = probe.metric({
          name  : stats[i].interface + ' input',
          value : function() { return 0; }
        });

        metrics[stats[i].interface]['output'] = probe.metric({
          name  : stats[i].interface + ' output',
          value : function() { return 0; }
        });
      }

      if (metrics[stats[i].interface]) {
		if (oldStats && oldStats[i]) {
          var output = (stats[i].outputBytes - oldStats[i].outputBytes) /  1000000;
          var input = (stats[i].inputBytes - oldStats[i].inputBytes) / 1000000;
        }
        else {
          var output = 0
          var input = 0;
        }

        metrics[stats[i].interface]['output'].set(output.toFixed(2) + 'MB/s');
        metrics[stats[i].interface]['input'].set(input.toFixed(2) + 'MB/s');

        totalIn += input;
        totalOut += output;

        if (i == (Object.keys(stats).length - 1)) {
          metrics.total.input.set(totalIn.toFixed(2) + 'MB/S');
          metrics.total.output.set(totalOut.toFixed(2) + 'MB/s');

          totalIn = 0;
          totalOut = 0;
        }
      }
    }
    oldStats = stats;
    setTimeout(function() { refreshNet(interval); }, interval * 1000);
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

function init(conf) {
  initMetrics();

  refreshNet(conf.small_interval);
}

module.exports.init = init;
