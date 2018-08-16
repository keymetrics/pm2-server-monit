'use strict'

const os = require('os')
const IfConfigNetworkMetric = require('./network/ifconfig')
const IPNetworkMetric = require('./network/ip')

module.exports = class NetworkMetrics {
  constructor (io, conf) {
    this.io = io
    this.conf = conf
    this.refreshInterval = parseInt(conf.network_refresh_rate) || 5
    this.interfaceNames = Object.keys(os.networkInterfaces())
      .filter(networkName => networkName !== 'lo')
    // store old values to compare with new one
    this.cache = []
    // store all metrics instance next to the interface name
    this.metricsStore = [
      {
        name: 'global',
        inbound: io.metric({
          name: 'network in',
          type: 'network/inbound',
          unit: 'MB/s'
        }),
        outbound: io.metric({
          name: 'network out',
          type: 'network/outbound',
          unit: 'MB/s'
        })
      }
    ]

    // determine which implementation to run
    const ifConfigFetch = new IfConfigNetworkMetric().fetch
    const ipFetch = new IPNetworkMetric().fetch

    ipFetch(err => {
      if (err) {
        // if it fail, fallback on ifconfig
        return ifConfigFetch(err => {
          // if it fail again, we will not launch the worker
          if (err) return console.error(`No network tool found to parse network data, stopping network monitoring`)
          // otherwise use ifconfig
          console.log('Using "ifconfig" as backend for network metrics')
          this._worker = setInterval(this.fetch.bind(this, ifConfigFetch), this.refreshInterval * 1000)
          this.fetch(ifConfigFetch)
        })
      }
      // if it succeed, use ip
      console.log('Using "ip" as backend for network metrics')
      this._worker = setInterval(this.fetch.bind(this, ipFetch), this.refreshInterval * 1000)
      this.fetch(ipFetch)
    })
  }

  updateOrCreateMetrics (networkInterface) {
    let metrics = this.metricsStore.find(store => store.name === networkInterface.name)
    // create them if not already the case
    if (metrics === null || metrics === undefined) {
      metrics = {
        name: networkInterface.name,
        inbound: this.io.metric({
          name: `${networkInterface.name} input`,
          type: 'network/inbound',
          unit: 'MB/s'
        }),
        outbound: this.io.metric({
          name: `${networkInterface.name} output`,
          type: 'network/outbound',
          unit: 'MB/s'
        })
      }
      this.metricsStore.push(metrics)
    }
    // update them
    metrics.inbound.set(networkInterface.inbound)
    metrics.outbound.set(networkInterface.outbound)
  }

  fetch (fetchImpl) {
    // use the correct backend to fetch metrics
    fetchImpl((err, interfaces) => {
      if (err) return console.error(`Error while fetching network stats`, err)

      interfaces = interfaces.filter(networkInterface => {
        return this.interfaceNames.includes(networkInterface.name)
      })
      // fake the global network in/out
      interfaces.push({
        name: 'global',
        inbound: interfaces.reduce((agg, netowrkInterface) => {
          agg += netowrkInterface.inbound
          return agg
        }, 0),
        outbound: interfaces.reduce((agg, netowrkInterface) => {
          agg += netowrkInterface.outbound
          return agg
        }, 0)
      })
      // compute the difference between the old one and the current one
      const values = interfaces.map(networkInterface => {
        // fetch old values if available
        const oldValues = this.cache
          .find(oldInterfaceValue => oldInterfaceValue.name === networkInterface.name)
        // if nothing in cache, just ignore and wait the next run
        if (oldValues === null | oldValues === undefined) {
          return {
            name: networkInterface.name,
            inbound: 0,
            outbound: 0
          }
        }

        return {
          name: networkInterface.name,
          inbound: (((networkInterface.inbound - oldValues.inbound) / this.refreshInterval) / 1000000).toFixed(2),
          outbound: (((networkInterface.outbound - oldValues.outbound) / this.refreshInterval) / 1000000).toFixed(2)
        }
      })
      // create metrics or update the metrics
      values.forEach(this.updateOrCreateMetrics.bind(this))

      // populate the cache for the next run
      this.cache = interfaces
    })
  }
}
