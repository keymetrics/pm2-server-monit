'use strict'

const assert = require('assert')

module.exports = class Plan {
  constructor (count, done) {
    this.done = done
    this.count = count
  }

  ok (expression) {
    if (expression) {
      assert(expression)
    }

    if (this.count === 0) {
      assert(false, 'Too many assertions called')
    } else {
      this.count--
    }

    if (this.count === 0) {
      this.done()
    }
  }
}
