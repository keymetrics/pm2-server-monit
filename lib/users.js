var pmx     = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();
var metrics = {};
var REFRESH_INTERVAL = 10000;


function refreshMetrics() {

  var usedMemProc = shelljs.exec('who | grep -v localhost | wc -l', { async : true, silent:true}, function(err, out) {
    if (err) {
      return pmx.notify('Fail: could not retrieve user metrics', err);
    }
    var users_connected = out;
    metrics.usersConnected.set(users_connected);
  });
}

function initMetrics() {
  metrics.usersConnected = Probe.metric({
    name  : 'TTY/SSH opened',
    value : 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 15,
      cmp : '>'
    }
  });
}

function init() {
  initMetrics();

  refreshMetrics();
  setInterval(refreshMetrics.bind(this), REFRESH_INTERVAL);
}

module.exports.init = init;
