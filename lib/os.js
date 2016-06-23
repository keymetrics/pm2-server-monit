var pmx = require('pmx');
var shelljs = require('shelljs');
var domain = require('domain');

var d = domain.create();
var Probe = pmx.probe();
var metrics = {};


function setMetrics() {
d.on('error', function(err){
  console.error(err.stack);
});

d.run(function(){

  var version;

  if (process.platform == 'linux') {
    //Debian, Ubuntu, CentOS
    var osVersionLinux = shelljs.exec("cat /etc/issue", { async : true, silent:true}, function(err, out) {
      if (err) throw new Error(err);
      version = out.match(/[\d]+(\.[\d][\d]?)?/);
      if (version != null)
        version = version[0];
      var distribution = out.match(/[\w]*/)[0];
      if (version != null && distribution != null) {
        var resultOs = distribution + ' ' + version;
        metrics.osRunning.set(resultOs);
      }
    });

   setTimeout( function () {
      //Red Hat
      if (version == null) {
        var osVersionRedHat = shelljs.exec("cat /etc/redhat-release", { async : true, silent:true}, function(err, out) {
          if (err) throw new Error(err);
          version = out.match(/[\d]+(\.[\d][\d]?)?/);
          if (version != null)
            version = version[0];
          var distribution = out.match(/[\w]+\s[a-zA-Z]/)[0];
          if (version != null && distribution != null) {
            var resultOs = distribution + ' ' + version;
            metrics.osRunning.set(resultOs);
          }
        });
      }
    }, 10000);
  }


  //MacOs
  if (process.platform == 'darwin') {
    var osVersionMac = shelljs.exec("sw_vers", { async : true, silent:true}, function(err, out) {
      if (err) throw err;
      var version = out.match(/[\n\r].*ProductVersion:\s*([^\n\r]*)/)[1];
      var distribution = out.match(/.*ProductName:\s*([^\n\r]*)/)[1];
      var resultOs = distribution + ' ' + version;
      metrics.osRunning.set(resultOs);
    });
  }

});
}

function initMetrics() {
  metrics.osRunning = Probe.metric({
    name  : 'Operating System',
    value : 'N/A'
  });
}

function init() {
  initMetrics();
  setMetrics();
}

module.exports.init = init;