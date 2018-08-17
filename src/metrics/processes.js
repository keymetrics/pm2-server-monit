'use strict'

const exec = require('../utils/exec.js')
const os = require('os')

module.exports = class ProcessesMetric {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.processCount = io.metric({
      name: 'Total Processes',
      type: 'os/process/alive'
    })
    this.zombieProcessCount = io.metric({
      name: 'Zombie processes',
      type: 'os/process/zombie'
    })

    this.refreshInterval = parseInt(conf.disk_refresh_rate) || 60

    // use different command for macos
    const fetchImpl = os.platform() === 'darwin' ? this.fetchDarwin.bind(this) : this.fetch.bind(this)
    this._worker = setInterval(fetchImpl, this.refreshInterval * 1000)
    fetchImpl()
  }

  fetchDarwin () {
    exec('ps -A', (err, stdout) => {
      if (err || stdout.length === 0) return console.error(`Failed to retrieve process count for darwin`, err)
      this.processCount.set(stdout.split('\n').length - 1)
    })
  }

  fetch () {
    // get process count
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /R|S|D|T/ { print $12 }'", (err, stdout) => {
      if (err || stdout.length === 0) return console.error(`Failed to retrieve process count`, err)
      this.processCount.set(stdout.split('\n').length - 1)
    })
    // get zombie process count
    exec("top -bn1 | awk 'NR > 7 && $8 ~ /Z/ { print $12 }'", (err, stdout, stderr) => {
      if (err || stderr.length > 0) return console.error(`Failed to retrieve zombie process count`, err)
      this.zombieProcessCount.set(stdout.split('\n').length - 1)
    })
  }
}
