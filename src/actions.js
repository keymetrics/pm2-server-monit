'use strict'

const exec = require('./utils/exec.js')

module.exports = class MonitoringActions {
  expose (io) {
    if (process.platform === 'linux') {
      io.action('top cpu consuming', function (reply) {
        exec('ps -eo pcpu,user,args --no-headers | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function (err, out) {
          return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
        })
      })

      io.action('top mem consuming', function (reply) {
        exec('ps -eo pmem,pid,cmd | sort -k 1 -n | tail -n 10 | sort -k 1 -nr | cut -c 1-70', function (err, out) {
          return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
        })
      })

      io.action('vmstats', function (reply) {
        exec('vmstat -S m', function (err, out) {
          return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
        })
      })
    }

    io.action('processes/users', function (reply) {
      exec('ps hax -o user | sort | uniq -c', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })

    io.action('disk usage', function (reply) {
      exec('df -h', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })

    io.action('who', function (reply) {
      exec('who', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })

    io.action('uptime', function (reply) {
      exec('uptime', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })

    io.action('open ports', function (reply) {
      exec('lsof -Pni4 | grep ESTABLISHED', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })

    io.action('ifconfig', function (reply) {
      exec('ifconfig', function (err, out) {
        return err ? reply(err.message) : reply(out.replace(/\n/g, '<br />'))
      })
    })
  }
}
