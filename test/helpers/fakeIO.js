'use strict'

const EventEmitter = require('events')

module.exports = class FakeIO extends EventEmitter {
  metric (options) {
    this.emit('create', { metrics: options })
    return {
      set: value => {
        this.emit('set', { metrics: options, value })
      }
    }
  }
}
