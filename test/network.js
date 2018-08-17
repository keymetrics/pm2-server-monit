/* eslint-env mocha */

'use strict'

process.env.NODE_ENV = 'test'

const assert = require('assert')
const FakeIO = require('./helpers/fakeIO.js')
const mock = require('mock-require')
const fs = require('fs')
const EXEC_PATH = '../src/utils/exec.js'
const path = require('path')
const Plan = require('./helpers/plan.js')

const fixtures = {
  ip: fs.readFileSync(path.resolve(__dirname, './fixtures/network_ip_output.txt')).toString(),
  bad_ip: fs.readFileSync(path.resolve(__dirname, './fixtures/network_ip_bad_output.txt')).toString(),
  ifconfig: fs.readFileSync(path.resolve(__dirname, './fixtures/network_ifconfig_output.txt')).toString(),
  bad_ifconfig: fs.readFileSync(path.resolve(__dirname, './fixtures/network_ip_bad_output.txt')).toString()
}

describe('network', _ => {
  afterEach(done => {
    mock.stopAll()
    return done()
  })
  it('should compute metrics with ip', function (done) {
    this.timeout(5000)
    const plan = new Plan(2, _ => {
      clearInterval(network._worker)
      return done()
    })
    mock(EXEC_PATH, (command, cb) => {
      if (command.indexOf('ifconfig') > -1) return cb(new Error(`Fake error`))
      return cb(null, fixtures.ip)
    })
    const NetworkMetrics = mock.reRequire('../src/metrics/network.js')
    const io = new FakeIO()
    const network = new NetworkMetrics(io, { network_refresh_rate: 1 }) // eslint-disable-line
    io.on('set', ({ metrics, value }) => {
      if (metrics.name === 'network in') {
        return plan.ok()
      }
      if (metrics.name === 'network out') {
        return plan.ok()
      }
    })
  })

  it('should compute metrics with ifconfig', function (done) {
    this.timeout(5000)
    const plan = new Plan(2, _ => {
      clearInterval(network._worker)
      return done()
    })
    mock(EXEC_PATH, function (command, cb) {
      if (command.indexOf('ip') > -1) return cb(new Error(`Fake error`))
      return cb(null, fixtures.ifconfig)
    })
    mock.reRequire('../src/metrics/network/ifconfig.js')
    mock.reRequire('../src/metrics/network/ip.js')
    const NetworkMetrics = mock.reRequire('../src/metrics/network.js')
    const io = new FakeIO()
    const network = new NetworkMetrics(io, { network_refresh_rate: 1 }) // eslint-disable-line
    io.on('set', ({ metrics, value }) => {
      if (metrics.name === 'network in') {
        return plan.ok()
      }
      if (metrics.name === 'network out') {
        return plan.ok()
      }
    })
  })

  it('should never set metrics if bad output from ip', function (done) {
    this.timeout(5000)
    mock(EXEC_PATH, function (command, cb) {
      if (command.indexOf('ifconfig') > -1) return cb(new Error(`Fake error`))
      return cb(null, fixtures.bad_ip)
    })
    mock.reRequire('../src/metrics/network/ifconfig.js')
    mock.reRequire('../src/metrics/network/ip.js')
    const NetworkMetrics = mock.reRequire('../src/metrics/network.js')
    const io = new FakeIO()
    const network = new NetworkMetrics(io, { network_refresh_rate: 1 }) // eslint-disable-line
    io.on('set', ({ metrics, value }) => {
      assert(false, 'should not set var')
    })
    setTimeout(_ => {
      clearInterval(network._worker)
      return done()
    }, 2000)
  })

  it('should never set metrics if bad output from ifconfig', function (done) {
    this.timeout(5000)
    mock(EXEC_PATH, function (command, cb) {
      if (command.indexOf('ip') > -1) return cb(new Error(`Fake error`))
      return cb(null, fixtures.bad_ifconfig)
    })
    mock.reRequire('../src/metrics/network/ifconfig.js')
    mock.reRequire('../src/metrics/network/ip.js')
    const NetworkMetrics = mock.reRequire('../src/metrics/network.js')
    const io = new FakeIO()
    const network = new NetworkMetrics(io, { network_refresh_rate: 1 }) // eslint-disable-line
    io.on('set', ({ metrics, value }) => {
      assert(false, 'should not set var')
    })
    setTimeout(_ => {
      clearInterval(network._worker)
      return done()
    }, 2000)
  })

  it('should never set metrics if both fail', function (done) {
    this.timeout(5000)
    mock(EXEC_PATH, function (command, cb) {
      return cb(new Error(`Fake error`))
    })
    mock.reRequire('../src/metrics/network/ifconfig.js')
    mock.reRequire('../src/metrics/network/ip.js')
    const NetworkMetrics = mock.reRequire('../src/metrics/network.js')
    const io = new FakeIO()
    const network = new NetworkMetrics(io, { network_refresh_rate: 1 }) // eslint-disable-line
    io.on('set', ({ metrics, value }) => {
      assert(false, 'should not set var')
    })
    setTimeout(_ => {
      clearInterval(network._worker)
      return done()
    }, 2000)
  })
})
