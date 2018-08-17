'use strict'

const exec = require('../utils/exec.js')

module.exports = class TTYMetric {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.ttyCount = io.metric({
      name: 'TTY/SSH opened',
      type: 'os/tty/open'
    })
    this.refreshInterval = parseInt(conf.disk_refresh_rate) || 60

    this._worker = setInterval(this.fetch.bind(this), this.refreshInterval * 1000)
    this.fetch()
  }

  fetch () {
    exec('who | grep -v localhost | wc -l', (err, stdout, stderr) => {
      if (err || stdout.length === 0) return console.error(`Failed to retrieve TTY metrics`, err)
      this.ttyCount.set(parseInt(stdout))
    })
  }
}
