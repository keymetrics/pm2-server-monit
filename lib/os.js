var pmx = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

var version;

if (process.platform == 'linux') {
  //Debian, Ubuntu, CentOS
  var osVersionLinux = shelljs.exec("cat /etc/issue", { async : true, silent:true}, function(err, out) {
    if (err)
      return;
    version = out.match(/[\d]+(\.[\d][\d]?)?/)[0];
    var distribution = out.match(/[\w]*/)[0];
    if (version != null && distribution != null) {
      var resultOs = distribution + ' ' + version;
      osRunning.set(resultOs);
    }
  });
}

//Red Hat
if (version == null) {
  var osVersionLinux = shelljs.exec("cat /etc/redhat-release", { async : true, silent:true}, function(err, out) {
    if (err)
      return;
    version = out.match(/[\d]+(\.[\d][\d]?)?/)[0];
    var distribution = out.match(/[\w]+\s[a-zA-Z]*/)[0];
    if (version != null && distribution != null) {
      var resultOs = distribution + ' ' + version;
      osRunning.set(resultOs);
    }
  });
}


//MacOs
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