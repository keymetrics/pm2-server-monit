'use strict'

const childProcess = require('child_process')
const opts = {
  env: Object.assign(process.env, {
    LANG: 'en_US.UTF-8'
  }),
  windowsHide: true, // give it anyway since ignored by non-windows systems
  shell: process.version.match(/^v4/g) !== null // Node version 4 (issue #51)
}

module.exports = function (cmd, cb) {
  return childProcess.exec(cmd, opts, cb)
}
