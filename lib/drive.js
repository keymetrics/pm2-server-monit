var pmx = require('pmx');
var probe = pmx.probe();

var resultUsed = 'N/A';
var resultFree = 'N/A';
var alert  = false;

var diskPattern = /^(\S+)\n?\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+?)\n/mg;

(function firstLaunch() {

    require('child_process').exec('df -k', {timeout:8000},
    function(error, stdout, stderr) {

      if (error) {
        return console.error('Fail: could not retrieve hard drive metrics', error);
      }
      
      if (!stdout) {
        return console.error('Fail: could not retrieve hard drive metrics', 'df -k failed or timed out');
      }
      
      var total = 0;
      var used = 0;
      var free = 0;

      var lines = parseDfStdout(stdout);
      var disk_info = lines[0];

      total = Math.ceil((disk_info['1K-blocks'] * 1024)/ Math.pow(1024,2));
      used = Math.ceil(disk_info.Used * 1024 / Math.pow(1024,2));
      free = Math.ceil(disk_info.Available * 1024 / Math.pow(1024,2));

      var total_gb = (total/1024).toFixed(1);
      var used_gb = (used/1024).toFixed(1);
      var free_gb = (free/1024).toFixed(1);

      var used_pour = (100 * used_gb/total_gb).toFixed(1);
      var free_pour = (100 * free_gb/total_gb).toFixed(1);

      if (free_pour < 10 && alert === false) {
        pmx.notify(new Error(disk_info.Filesystem + ' Disk almost full'));
        alert = true;
      }
      else if (free_pour > 10 && alert === true) {
        alert = false;
      }

      resultUsed = used_gb + 'GB / ' + total_gb + 'GB';
      resultFree = free_pour + '%';
    });

  setTimeout(firstLaunch, 60000);
})();

var freeDrive = probe.metric({
  name: 'Avail. Disk',
  value: function() {
    return resultFree;
  },
  alert : {
    mode : 'threshold-avg',
    value : 10,
    msg : '90% of drive is used',
    cmp : '<'
  }
});

var usedDrive = probe.metric({
  name: 'Used space',
  value: function() {
    return resultUsed;
  }
});

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
