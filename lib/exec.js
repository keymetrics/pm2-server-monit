var cp = require('child_process');

module.exports = function (cmd, cb) {
  // Node version 4 (issue #51)
  if (process.version.match(/^v4/g) != null) {
    return cp.exec(cmd, cb);
  }
  return cp.exec(cmd, { shell: true }, cb);
}
