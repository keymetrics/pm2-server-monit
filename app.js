
var cpu = require('./lib/cpu'),
    os = require('./lib/os'),
    drive = require('./lib/drive');

if (process.platform == 'linux')
  var netstat = require('./lib/netstat'),
      mem = require('./lib/mem'),
      proc = require('./lib/proc');
