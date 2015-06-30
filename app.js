
var cpu = require('./lib/cpu'),
    os = require('./lib/os'),
    drive = require('./lib/drive'),
    users = require('./lib/users'),
    pmx = require('pmx'),
    pm2 = require('pm2'),
    fs      = require('fs'),
    path    = require('path');

if (process.platform == 'linux')
  var netstat = require('./lib/netstat'),
      mem = require('./lib/mem'),
      proc = require('./lib/proc');


var conf = pmx.initModule({

  pid              : pmx.resolvePidPaths([]),

  widget : {
    type             : 'generic',
    logo             : 'http://serverental.com/server-rental/wp-content/uploads/2013/12/DellPowerEdger510Server2U2-socketrackserver.png',

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
});
