
var pmx = require('pmx');

var conf = pmx.initModule({
  widget : {
    type             : 'generic',
    logo             : 'https://www.glcomp.com/media/catalog/category/Dell-R620_3_1_1.png',

    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme            : ['#111111', '#1B2228', '#807C7C', '#807C7C'],

    el : {
      probes  : true,
      actions : true
    },

    block : {
      actions : false,
      issues  : true,
      meta : true,
      cpu: false,
      mem: false,
      main_probes : ['CPU usage', 'Free memory', 'Avail. Disk', 'Total Processes', 'TTY/SSH opened', 'eth0 input', 'eth0 output', 'Operating System']
    }

    // Status
    // Green / Yellow / Red
  }
}, function() {

  var cpu = require('./lib/cpu'),
      os = require('./lib/os'),
      drive = require('./lib/drive'),
      users = require('./lib/users'),
      shelljs = require('shelljs'),
      fs      = require('fs'),
      path    = require('path');

  if (process.platform == 'linux')
    var netstat = require('./lib/netstat'),
        mem = require('./lib/mem'),
        proc = require('./lib/proc');

  require('./lib/actions.js');
});
