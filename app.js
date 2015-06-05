
var cpu = require('./lib/cpu'),
		drive = require('./lib/drive'),
		http = require('http');

if (process.platform == 'linux')
	var netstat = require('./lib/netstat'),
			security = require('./lib/security'),
			mem = require('./lib/mem'),
			osLinux = require('./lib/os'),
  		proc = require('./lib/proc');

http.createServer(function(req, res) {
  res.end('Thanks');
}).listen(5005);
