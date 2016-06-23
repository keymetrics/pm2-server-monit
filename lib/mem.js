var pmx     = require('pmx');
var shelljs = require('shelljs');
var Probe = pmx.probe();

var metrics = {};
var REFRESH_RATE = 10000;

function refreshMetrics() {

  var usedMemProc = shelljs.exec('cat /proc/meminfo | head -5', { async : true, silent:true}, function(err, out) {

    if (err) {
      return pmx.notify('Fail: could not retrieve mem metrics', err);
    }

    var result_memory = (out.match(/\d+/g));
    var total_mem = result_memory[0];
    var free_mem = parseInt(result_memory[1]) + (parseInt(result_memory[3]) + parseInt(result_memory[4]));
    var total_mem_gb = (total_mem/1024/1024).toFixed(1) + 'GB';
    var used_mem = ((total_mem - free_mem)/1024/1024).toFixed(1) + 'GB';
    var result_memory_used = used_mem + ' / ' + total_mem_gb;
    var free_mem_pour = (100 * (free_mem / total_mem)).toFixed(1) + '%';

    metrics.freeMem.set(free_mem_pour);
    metrics.memUsed.set(result_memory_used);
  });
}

function initMetrics() {
  metrics.freeMem = Probe.metric({
    name  : 'Free memory',
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 10,
      msg : 'Less than 10% memory available',
      cmp : '<'
    }
  });

  metrics.memUsed = Probe.metric({
    name  : 'Used memory',
    value : 'N/A'
  });
}

function init() {
  initMetrics();
  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_RATE);
}

module.exports.init = init;