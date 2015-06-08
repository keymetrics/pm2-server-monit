var pmx = require('pmx');
var probe = pmx.probe();

var resultUsed = 'N/A';
var resultFree = 'N/A';

setInterval(function() {

  require('child_process').exec('df -k', function(error, stdout, stderr) {
    
    var total = 0;
    var used = 0;
    var free = 0;

    var lines = stdout.split("\n");

    var str_disk_info = lines[1].replace( /[\s\n\r]+/g,' ');

    var disk_info = str_disk_info.split(' ');

    total = Math.ceil((disk_info[1] * 1024)/ Math.pow(1024,2));
    used = Math.ceil(disk_info[2] * 1024 / Math.pow(1024,2)) ;
    free = Math.ceil(disk_info[3] * 1024 / Math.pow(1024,2)) ;

    var total_gb = (total/1024).toFixed(1);
    var used_gb = (used/1024).toFixed(1);
    var free_gb = (free/1024).toFixed(1);

    var used_pour = (100 * used_gb/total_gb).toFixed(1);
    var free_pour = (100 * free_gb/total_gb).toFixed(1);

    resultUsed = used_gb + 'GB / ' + total_gb + 'GB';
    resultFree = free_pour + '%';

  });

}, 10000)



var freeDrive = probe.metric({
  name: 'Free drive space',
  value: function() {
    return resultFree;
  }
});

var usedDrive = probe.metric({
  name: 'Used drive space',
  value: function() {
    return resultUsed;
  }
});