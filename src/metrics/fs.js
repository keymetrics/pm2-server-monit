'use strict'

const fs = require('fs')

module.exports = class FSMetric {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.fdOpen = io.metric({
      name: 'Opened FD',
      type: 'os/disk/fd/open'
    })
    this.refreshInterval = parseInt(conf.disk_refresh_rate) || 60

    this._worker = setInterval(this.fetch.bind(this), this.refreshInterval * 1000)
    this.fetch()
  }

  fetch () {
    const columnPattern = /(\S+)/mg
    fs.readFile('/proc/sys/fs/file-nr', (err, out) => {
      if (err) return console.error(`Failed to retrieve number of file descriptor`, err)
      const output = out.toString()
      const parsed = columnPattern.exec(output)
      if (parsed.length === 0) return
      const result = parseInt(parsed[0])
      this.fdOpen.set(result)
    })
  }
}
