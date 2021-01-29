#!/usr/bin/env node
'use strict'

const co = require('co')
const frida = require('frida')
const fs = require('fs-promise')
const path = require('path')
const sleep = require('co-sleep');
const pkg = require('./package.json')

console.log('')
console.log('anzu %s - %s', pkg.version, pkg.description)
console.log('Copyright (c) %s', pkg.author.name)
console.log('')

const [processName, destinationPath] = process.argv.slice(2)
if (typeof processName != 'string' || typeof destinationPath != 'string') {
  console.log('Usage: ... <process name|id> <destination path>')
  return
}

co(function* () {
  const session = yield frida.attach(isNaN(processName) ? processName : parseInt(processName))
  const script = yield session.createScript((yield fs.readFile(require.resolve('./dst/agent'))).toString())
  script.message.connect((message, data) => {
    if (message.payload.type !== undefined || message.payload.type === 'progress') {
      console.log(` [>] ${message.payload.path}`)
    } else {
      console.log(' [i] %s', message)
    }
  })

  yield script.load()

  if(process.argv.includes('debug')) {
    console.log(' [*] Sleeping for debugger attach')
    yield sleep(5000)
  }

  const agent = script.exports;
  const packageFullName = yield agent.getPackageFullName()
  if (packageFullName.length <= 0) {
    yield Promise.reject(new Error('Specified process has no identity.'))
  }
  console.log(' [*] Package Full Name: %s', packageFullName)
  
  try {
    yield agent.dumpPackageContentsInto(path.resolve(destinationPath))
  } finally {
    yield [script.unload(), session.detach()]
  }

  console.log(' [*] Done.')

}).catch(err => {
  console.error(' %s', err.stack)
})