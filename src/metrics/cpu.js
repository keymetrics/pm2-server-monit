'use strict'

const os = require('os')

module.exports = class CPUMetric {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.cpuUsage = io.metric({
      name: 'CPU usage',
      type: 'os/cpu/usage',
      unit: '%'
    })
    this.refreshInterval = parseInt(conf.cpu_refresh_rate) || 2

    this._worker = setInterval(this.fetch.bind(this), this.refreshInterval * 1000)
    this.fetch()
  }

  fetch () {
    const startMeasure = this.computeUsage()
    setTimeout(_ => {
      var endMeasure = this.computeUsage()

      var idleDifference = endMeasure.idle - startMeasure.idle
      var totalDifference = endMeasure.total - startMeasure.total

      var percentageCPU = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100
      this.cpuUsage.set(percentageCPU)
    }, 100)
  }

  computeUsage () {
    let totalIdle = 0
    let totalTick = 0
    const cpus = os.cpus()

    for (var i = 0, len = cpus.length; i < len; i++) {
      var cpu = cpus[i]
      for (let type in cpu.times) {
        totalTick += cpu.times[type]
      }
      totalIdle += cpu.times.idle
    }

    return {
      idle: parseInt(totalIdle / cpus.length),
      total: parseInt(totalTick / cpus.length)
    }
  }
}
