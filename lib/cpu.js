var cpuStats = require('cpu-stats');

var pmx = require('pmx');
var probe = pmx.probe();

var jl_result;

setInterval(function() {

  cpuStats(100, function(error, result) {

    if(error) return console.error('Oh noes!', error);

    var cpu = 0;
    var number_cpu = result.length;

    result.forEach(function(value) {
      cpu += value.cpu;
    });

    jl_result = (cpu/number_cpu).toFixed(2) + '%';

  });

}, 1000);

var cpuResult = probe.metric({
  name: 'CPU usage',
  value: function() {
    return jl_result;
  }
});
