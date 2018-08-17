'use strict'

const exec = require('../utils/exec.js')

module.exports = class DiskMetric {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.refreshInterval = parseInt(conf.disk_refresh_rate) || 60
    // default disk is /
    conf.disk_monitored = conf.disk_monitored || '/'
    // allow to monitor multiple disk
    this.monitoredDisks = conf.disk_monitored.indexOf(',') > -1
      ? conf.disk_monitored.split(',') : [ conf.disk_monitored ]

    // compute the metrics for each disk
    this.metricsStore = this.monitoredDisks.map((diskName, index) => {
      const getMetricName = prefix => `${prefix}${index === 0 ? '' : ` on ${diskName}`}`
      return {
        name: diskName,
        freeSpace: io.metric({
          name: getMetricName('Avail. Disk'),
          type: 'os/disk/space/free',
          unit: '%'
        }),
        usedSpace: io.metric({
          name: getMetricName('Used space'),
          type: 'os/disk/space/used',
          unit: 'GB'
        }),
        totalSpace: io.metric({
          name: getMetricName('Total Disk space'),
          type: 'os/disk/space/total',
          unit: 'GB'
        })
      }
    })

    this._worker = setInterval(this.fetch.bind(this), this.refreshInterval * 1000)
    this.fetch()
  }

  fetch () {
    exec('df -kP', (err, out) => {
      if (err || !out || typeof (out) === 'undefined') {
        return console.error('Could not retrieve disk metrics', err)
      }

      var disks = this.parseOutput(out)
      this.metricsStore.forEach(store => {
        const disk = disks.find(disk => disk.mount === store.name)
        if (disk === null || disk === undefined) return

        const total = disk.available + disk.used
        const free = ((disk.available / total) * 100).toFixed(2) // in %
        const used = (disk.used / 1000 / 1000).toFixed(2) // in GB
        const totalFormat = (total / 1000 / 1000).toFixed(2) // in GB
        store.freeSpace.set(free)
        store.usedSpace.set(used)
        store.totalSpace.set(totalFormat)
      })
    })
  }

  parseOutput (output) {
    const columnPattern = /(\S+)/mg
    return output.split('\n').filter((line, index) => {
      return index > 0
    }).map(line => {
      let res = null
      const values = []
      while ((res = columnPattern.exec(line)) !== null) {
        values.push(res[0])
      }
      return values
    }).filter(values => {
      return values.length > 0
    }).map(values => {
      return {
        mount: values[5],
        available: parseInt(values[3]),
        used: parseInt(values[2])
      }
    })
  }
}
