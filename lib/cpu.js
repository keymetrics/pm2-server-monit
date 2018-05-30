var pmx       = require('pmx');
var os = require("os");

var probe = pmx.probe();
var metrics = {};

function refreshMetrics(interval) {

  function cpuAverage() {

    var totalIdle = 0, totalTick = 0;
    var cpus = os.cpus();

    for(var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[i];
      for(type in cpu.times) {
        totalTick += cpu.times[type];
     }
      totalIdle += cpu.times.idle;
    }

    return {idle: totalIdle / cpus.length,  total: totalTick / cpus.length};
  }

  var startMeasure = cpuAverage();

  setTimeout(function() {

    var endMeasure = cpuAverage();

    var idleDifference = endMeasure.idle - startMeasure.idle;
    var totalDifference = endMeasure.total - startMeasure.total;

    var percentageCPU = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100;

    metrics.cpuResult.set(percentageCPU + '%');
    setTimeout(function() { refreshMetrics(interval); }, interval * 1000);
  }, 100);
}

function initMetrics(percentageAlertThreshold) {
  metrics.cpuResult = probe.metric({
    name: 'CPU usage',
    value: 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : percentageAlertThreshold,
      interval : 100,
      cmp : '>'
    }
  });
}

function init(conf) {
  initMetrics(conf.cpu_percent_usage_alert_threshold);
  refreshMetrics(conf.small_interval);
}

module.exports.init = init;
