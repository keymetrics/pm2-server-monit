
var cpu = require('./lib/cpu'),
    drive = require('./lib/drive');

if (process.platform == 'linux')
  var netstat = require('./lib/netstat'),
      mem = require('./lib/mem'),
      osLinux = require('./lib/os'),
      proc = require('./lib/proc');
