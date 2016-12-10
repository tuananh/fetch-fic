'use strict'
module.exports = promisify
const Bluebird = require('bluebird')

function promisify (fn, bind) {
  const pfn = Bluebird.promisify(fn)
  return function () {
    const self = bind || this
    return Bluebird.all(arguments).spread(function () {
      return pfn.apply(self, arguments)
    })
  }
}

promisify.sync = function (fn, bind) {
  return function () {
    const self = bind || this
    return Bluebird.all(arguments).spread(function () {
      return fn.apply(self, arguments)
    })
  }
}
