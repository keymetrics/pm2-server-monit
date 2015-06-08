var pmx = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

if (process.platform == 'linux') {
  var osVersionLinux = shelljs.exec("lsb_release -a", { async : true, silent:true}, function(err, out) {
    var version = out.match(/[\n\r].*Release:\s*([^\n\r]*)/)[1];
    var distribution = out.match(/.*ID:\s*([^\n\r]*)/)[1];
    var resultOs = distribution + ' ' + version;
    osRunning.set(resultOs);
  });
}

if (process.platform == 'darwin') {
  var osVersionMac = shelljs.exec("sw_vers", { async : true, silent:true}, function(err, out) {
    var version = out.match(/[\n\r].*ProductVersion:\s*([^\n\r]*)/)[1];
    var distribution = out.match(/.*ProductName:\s*([^\n\r]*)/)[1];
    var resultOs = distribution + ' ' + version;
    osRunning.set(resultOs);
  });
}

var osRunning = Probe.metric({
  name  : 'Operating System',
  value : function() { return 'N/A'; }
});