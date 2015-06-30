var pmx = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

if (process.platform == 'linux') {
  //Debian, Ubuntu, CentOS
  var osVersionLinux = shelljs.exec("cat /etc/issue", { async : true, silent:true}, function(err, out) {
    if (err)
      return;
    var version = out.match(/[\d]+(\.[\d][\d]?)?/)[0];
    var distribution = out.match(/[\w]*/)[0];
    var resultOs = distribution + ' ' + version;
    osRunning.set(resultOs);
  });
}

if (process.platform == 'darwin') {
  var osVersionMac = shelljs.exec("sw_vers", { async : true, silent:true}, function(err, out) {
    if (err)
      return;
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
