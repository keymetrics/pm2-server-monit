var cp = require('child_process');

var opts = {
  env: {
    LANG: 'en_US.UTF-8'
  }
}

// Node version 4 (issue #51)
if (process.version.match(/^v4/g) != null) {
  opts.shell = true
}

module.exports = function (cmd, cb) {
  cp.exec(cmd, opts, cb);
}
