'use strict'

const exec = require('../../utils/exec')

module.exports = class IPNetworkMetric {
  fetch (cb) {
    exec('ip -s link', function (err, out) {
      if (err) return cb(err)

      const names = new RegExp(/[0-9]+: ([\S]+): /g)
      const RX = new RegExp(/ {4}RX: bytes  packets  errors  dropped overrun mcast\s*\n\s*([0-9]+) /gm) // eslint-disable-line
      const TX = new RegExp(/ {4}TX: bytes  packets  errors  dropped carrier collsns \s*\n\s*([0-9]+) /g) // eslint-disable-line

      let interfaces = []
      let i = 0
      let res = null

      while ((res = names.exec(out)) !== null) {
        interfaces.push({
          name: res[1]
        })
      }

      i = 0
      while ((res = RX.exec(out)) !== null) {
        interfaces[i++].inbound = parseInt(res[1])
      }
      i = 0
      while ((res = TX.exec(out)) !== null) {
        interfaces[i++].outbound = parseInt(res[1])
      }

      // filter out invalid interfaces
      interfaces = interfaces.filter(netInterface => {
        return netInterface.name && typeof netInterface.inbound === 'number' &&
          typeof netInterface.outbound === 'number'
      })
      return cb(null, interfaces)
    })
  }
}
