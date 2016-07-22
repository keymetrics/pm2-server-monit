var cpuStats  = require('cpu-stats');
var pmx       = require('pmx');

var probe = pmx.probe();
var metrics = {};
var REFRESH_RATE = 1000;

function refreshMetrics() {

  cpuStats(100, function(error, result) {
    var jl_result;

    if(error) {
      return pmx.notify('Fail: could not retrieve cpu metrics ' +  error);
    }

    var cpu = 0;
    var number_cpu = result.length;
    result.forEach(function(value) {
      cpu += value.cpu;
    });
    jl_result = (cpu/number_cpu).toFixed(2) + '%';
    metrics.cpuResult.set(jl_result);
  });
}

function initMetrics() {
  metrics.cpuResult = probe.metric({
    name: 'CPU usage',
    value: 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 90,
      interval : 100,
      msg : 'CPU usage reached threshold:',
      cmp : '>'
    }
  });
}

function init() {
  initMetrics();
  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_RATE);
}

module.exports.init = init;