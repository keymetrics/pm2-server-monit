'use strict'

const io = require('@pm2/io')
const CPUMetrics = require('./metrics/cpu.js')
const NetworkMetrics = require('./metrics/network.js')

io.initModule({
  widget: {
    type: 'generic',
    logo: 'https://www.glcomp.com/media/catalog/category/Dell-R620_3_1_1.png',

    theme: ['#111111', '#1B2228', '#807C7C', '#807C7C'],

    el: {
      probes: true,
      actions: true
    },

    block: {
      actions: false,
      issues: true,
      meta: true,
      cpu: false,
      mem: false,
      main_probes: [
        'CPU usage',
        'Free memory',
        'Avail. Disk',
        'Total Processes',
        'TTY/SSH opened',
        'network in',
        'network out'
      ]
    }
  }
}, function (err, conf) {
  if (err) {
    io.notifyError(err)
    return process.exit(1)
  }

  const cpu = new CPUMetrics(io, conf) // eslint-disable-line
  const network = new NetworkMetrics(io, conf)  // eslint-disable-line
})
