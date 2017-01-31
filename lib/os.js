var pmx     = require('pmx');
var shelljs = require('shelljs');
var domain  = require('domain');
var fs = require('fs')

var d = domain.create();
var Probe = pmx.probe();
var metrics = {};


function setMetrics() {
  if (process.platform == 'linux') {
    //Debian, Ubuntu, CentOS
    fs.readFile("/etc/issue", function(err, out) {
      if (err) {
        return err;
      }
      out = out.toString()
      var version = out.match(/[\d]+(\.[\d][\d]?)?/);
      if (version != null)
      version = version[0];
      var distribution = out.match(/[\w]*/)[0];
      if (version != null && distribution != null) {
        var resultOs = distribution + ' ' + version;
        metrics.osRunning.set(resultOs);
      } else if (distribution != null && distribution != '') {
        metrics.osRunning.set(distribution);
      } else if (version == null) {
        fs.readFile("/etc/redhat-release", function(err, out) {
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
    });
  } else if (process.platform == 'darwin') {
    shelljs.exec("sw_vers", { async : true, silent:true}, function(err, out) {
      if (err) throw err;
      var version = out.match(/[\n\r].*ProductVersion:\s*([^\n\r]*)/)[1];
      var distribution = out.match(/.*ProductName:\s*([^\n\r]*)/)[1];
      var resultOs = distribution + ' ' + version;
      metrics.osRunning.set(resultOs);
    });
  } else {
    shelljs.exec("uname -sr", { async: true, silent: true}; function(err, out) {
      if (!err && out != '') {
        metrics.osRunning.set(out);
      } else {
        metrics.osRunning.set('❌');
      }
    })
  }
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
