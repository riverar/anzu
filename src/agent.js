'use strict'

const win32 = require('./win32')
const appx = require('./appx')
const co = require('co')
const nullptr = NULL

rpc.exports = {
  getPackageFullName: () => {
    return co(function* () {
      return yield Promise.resolve(appx.getPackageFullNameForProcess(win32.getCurrentProcess()))
    })
  },

  dumpPackageContentsInto: (to) => {
    return co(function* () {
      const from = `${appx.getWindowsAppsPath()}\\${appx.getPackageFullNameForProcess(win32.getCurrentProcess())}\\*.*`
      return yield dumpPackageContents(from, to)
    })
  }
}

function dumpPackageContents(from, to) {
  return co(function* () {
    function* itemsIn(directory) {
      const structSize = win32.WIN32_FIND_DATA.size()
      const structPtr = Memory.alloc(structSize);
      for (let i = 0; i < structSize; i++)
        Memory.writeU8(structPtr.add(i), 0)

      const directoryPtr = Memory.allocUtf16String(directory);
      const handle = win32.findFirstFile(directoryPtr, structPtr) // Skip: .
      win32.findNextFile(handle, structPtr)                       // Skip: ..
      while (win32.findNextFile(handle, structPtr) > 0)
      {
        yield new win32.WIN32_FIND_DATA(structPtr)
      }
    }

    for(let itemFound of itemsIn(from)) {
      const fullSrcPath = `${from.substring(0, from.lastIndexOf('\\'))}\\${itemFound.fileName}`
      const fullDstPath = `${to}\\${itemFound.fileName}`

      if(itemFound.isDirectory) {
        yield dumpPackageContents(`${fullSrcPath}\\*.*`, fullDstPath)
      } else {
        yield dumpPackageItem(fullSrcPath, fullDstPath, itemFound.fileSize)
      }
    }
  })
}

function dumpPackageItem(from, to, bytecount) {
  return co(function* () {
    const fromPtr = Memory.allocUtf16String(from)
    const fileHandle = win32.createFile(fromPtr, win32.access.read, win32.share.read,
      nullptr, win32.disposition.openExisting, 0, nullptr)
    const fileStream = new Win32InputStream(fileHandle)

    const toWithoutFileName = to.substring(0, to.lastIndexOf('\\'))
    win32.shCreateDirectoryEx(nullptr, Memory.allocUtf16String(toWithoutFileName), nullptr)

    const buffer = yield fileStream.read(bytecount)
    send({ type: 'progress', path: to });

      try {
        const file = new File(to, 'wb')
        file.write(buffer)
        file.close()
      } catch (error) {
        yield Promise.reject(error);
      }
  })
}