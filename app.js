
var cpu = require('./lib/cpu'),
    os = require('./lib/os'),
    drive = require('./lib/drive'),
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
    logo             : 'http://mingersoft.com/blog/wp-content/uploads/2012/02/Home-Server-Logo.png',

    // 0 = main element
    // 1 = secondary
    // 2 = main border
    // 3 = secondary border
    theme            : ['#568FFF', '#70A0FF', 'white', 'white'],

    el : {
      probes  : true,
      actions : true
    },

    block : {
      actions : true,
      issues  : true,
      meta : false,
      cpu: false,
      mem: false,
      main_probes : ['CPU usage', 'Free space', 'Free memory', 'All processes', 'eth0 input', 'eth0 output']
    }

    // Status
    // Green / Yellow / Red
  }
});