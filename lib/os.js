var pmx = require('pmx');
var shelljs = require('shelljs');

var Probe = pmx.probe();

var osVersion = shelljs.exec("lsb_release -a", { async : true, silent:true}, function(err, out) {
  var version = out.match(/[\n\r].*Release:\s*([^\n\r]*)/)[1];
  var distribution = out.match(/.*ID:\s*([^\n\r]*)/)[1];
  console.log(version + ' ' + distribution);
  var resultOs = distribution + ' ' + version;
  osRunning.set(resultOs);
});

var osRunning = Probe.metric({
  name  : 'Operating System',
  value : function() { return 'N/A'; }
});