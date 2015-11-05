var pmx = require('pmx');
var probe = pmx.probe();

var resultUsed = 'N/A';
var resultFree = 'N/A';
var alert  = false;

(function firstLaunch() {

    require('child_process').exec('df -k', {timeout:8000},
    function(error, stdout, stderr) {

      if (error) {
        return console.error('Fail: could not retrieve hard drive metrics', error);
      }
      var total = 0;
      var used = 0;
      var free = 0;

      var lines = stdout.split("\n");

      var str_disk_info = lines[1].replace( /[\s\n\r]+/g,' ');

      var disk_info = str_disk_info.split(' ');

      total = Math.ceil((disk_info[1] * 1024)/ Math.pow(1024,2));
      used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024,2));
      free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024,2));

      var total_gb = (total/1024).toFixed(1);
      var used_gb = (used/1024).toFixed(1);
      var free_gb = (free/1024).toFixed(1);

      var used_pour = (100 * used_gb/total_gb).toFixed(1);
      var free_pour = (100 * free_gb/total_gb).toFixed(1);


      if (free_pour < 10 && alert == false) {
        pmx.notify(new Error(disk_info[0] + ' Disk almost full'));
        alert = true;
      }
      else if (free_pour > 10 && alert == true) {
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
