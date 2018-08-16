'use strict'

const exec = require('../../utils/exec')

module.exports = class IfConfigNetworkMetric {
  fetch (cb) {
    exec('ifconfig', function (err, out) {
      if (err) return cb(err)

      var blocks = this.breakIntoBlocks(out)
      const interfaces = blocks.map(this.parseSingleBlock).map(data => {
        return {
          name: data.device,
          inbound: data.other ? data.other.rxBytes : 0,
          outbound: data.other ? data.other.txBytes : 0
        }
      })
      return cb(null, interfaces)
    })
  }

  breakIntoBlocks (fullText) {
    var blocks = []
    var lines = fullText.split('\n')
    var currentBlock = []
    lines.forEach(function (line) {
      if (line.length > 0 && ['\t', ' '].indexOf(line[0]) === -1 && currentBlock.length > 0) { // start of a new block detected
        blocks.push(currentBlock)
        currentBlock = []
      }
      if (line.trim()) {
        currentBlock.push(line)
      }
    })
    if (currentBlock.length > 0) {
      blocks.push(currentBlock)
    }
    return blocks
  }

  parseSingleBlock (block) {
    var data = {}
    block.forEach(function (line, i) {
      var match = line.match(/^(\S+)\s+Link/)
      if (i === 0) {
        var match2 = line.match(/([a-zA-Z0-9]+):\s/)
        if (match == null && match2) {
          match = match2
        }
      }
      if (match) { // eth0      Link encap:Ethernet  HWaddr 04:01:d3:db:fd:01
        data.device = match[1] // eth0
        var link = {}
        match = line.match(/encap:(\S+)/)
        if (match) {
          link.encap = match[1]
        }
        match = line.match(/HWaddr\s+(\S+)/)
        if (match) {
          link.hwaddr = match[1]
        }
        data.link = link
      } else {
        var section = data.other || {}
        if ((match = line.match(/collisions:(\S+)/)) !== null) {
          section.collisions = parseInt(match[1])
        }
        if ((match = line.match(/txqueuelen:(\S+)/)) !== null) {
          section.txqueuelen = parseInt(match[1])
        }
        if ((match = line.match(/RX bytes:(\S+)/)) !== null) {
          section.rxBytes = parseInt(match[1])
        }
        if ((match = line.match(/RX packets (\S+) {2}bytes (\S+)/)) !== null) {
          section.rxBytes = parseInt(match[2])
        }
        if ((match = line.match(/TX bytes:(\S+)/)) !== null) {
          section.txBytes = parseInt(match[1])
        }
        if ((match = line.match(/TX packets (\S+) {2}bytes (\S+)/)) !== null) {
          section.txBytes = parseInt(match[2])
        }
        data.other = section
      }
    })
    return data
  }
}
