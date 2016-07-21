var pmx       = require('pmx');
var shelljs   = require('shelljs');

var probe = pmx.probe();
var metrics = {};
var REFRESH_RATE = 60000;
var diskPattern = /^(\S+)\n?\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\n/mg;

function refreshMetrics(conf) {
  shelljs.exec('df -k', { async : true, silent : true }, function(err, out) {

    if (err || !out || (typeof(out) === 'undefined')) {
      return pmx.notify('Fail: could not retrieve hard drive metrics');
    }
    
    var total = 0;
    var used = 0;
    var free = 0;

    var lines = parseDfStdout(out);

    for (i = 0; i < lines.length; i++) {
      if(lines[i]['Mounted on'] === conf.drive)
        var disk_info = lines[i];
    }

    if (typeof(disk_info) === 'undefined') {
      return pmx.notify('disk name invalid');
    }

    total = Math.ceil((disk_info['1K-blocks'] * 1024)/ Math.pow(1024,2));
    used = Math.ceil(disk_info.Used * 1024 / Math.pow(1024,2));
    free = Math.ceil(disk_info.Available * 1024 / Math.pow(1024,2));

    var total_gb = (total/1024).toFixed(1);
    var used_gb = (used/1024).toFixed(1);
    var free_gb = (free/1024).toFixed(1);

    var used_pour = (100 * used_gb/total_gb).toFixed(1);
    var free_pour = (100 * free_gb/total_gb).toFixed(1);

    resultUsed = used_gb + 'GB / ' + total_gb + 'GB';
    resultFree = free_pour + '%';

    metrics.freeDrive.set(resultFree);
    metrics.usedDrive.set(resultUsed);
  });
}

function initMetrics() {
  metrics.freeDrive = probe.metric({
    name: 'Avail. Disk',
    value: 'N/A',
    alert : {
      mode : 'threshold-avg',
      value : 10,
      msg : 'Threshold attained for disk',
      cmp : '<'
    }
  });

  metrics.usedDrive = probe.metric({
    name: 'Used space',
    value: 'N/A'
  });
}

function parseDfStdout(stdout) {
  var dfInfo = [];
  var headline;
  stdout.replace(diskPattern, function() {
    var args = Array.prototype.slice.call(arguments, 1, 7);
    if (arguments[7] === 0) {
      headline = args;
      return;
    }
    dfInfo.push(createDiskInfo(headline, args));
  });

  return dfInfo;
}

function createDiskInfo(headlineArgs, args) {
  var info = {};
  headlineArgs.forEach(function(h, i) {
    info[h] = args[i];
  });
  return info;
}

function init(conf) {
  initMetrics();

  refreshMetrics(conf);
  setInterval(refreshMetrics.bind(this, conf), REFRESH_RATE);
}

module.exports.init = init;