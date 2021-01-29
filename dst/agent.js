(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){

/**
 * slice() reference.
 */

var slice = Array.prototype.slice;

/**
 * Expose `co`.
 */

module.exports = co['default'] = co.co = co;

/**
 * Wrap the given generator `fn` into a
 * function that returns a promise.
 * This is a separate function so that
 * every `co()` call doesn't create a new,
 * unnecessary closure.
 *
 * @param {GeneratorFunction} fn
 * @return {Function}
 * @api public
 */

co.wrap = function (fn) {
  createPromise.__generatorFunction__ = fn;
  return createPromise;
  function createPromise() {
    return co.call(this, fn.apply(this, arguments));
  }
};

/**
 * Execute the generator function or a generator
 * and return a promise.
 *
 * @param {Function} fn
 * @return {Promise}
 * @api public
 */

function co(gen) {
  var ctx = this;
  var args = slice.call(arguments, 1)

  // we wrap everything in a promise to avoid promise chaining,
  // which leads to memory leak errors.
  // see https://github.com/tj/co/issues/180
  return new Promise(function(resolve, reject) {
    if (typeof gen === 'function') gen = gen.apply(ctx, args);
    if (!gen || typeof gen.next !== 'function') return resolve(gen);

    onFulfilled();

    /**
     * @param {Mixed} res
     * @return {Promise}
     * @api private
     */

    function onFulfilled(res) {
      var ret;
      try {
        ret = gen.next(res);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * @param {Error} err
     * @return {Promise}
     * @api private
     */

    function onRejected(err) {
      var ret;
      try {
        ret = gen.throw(err);
      } catch (e) {
        return reject(e);
      }
      next(ret);
    }

    /**
     * Get the next value in the generator,
     * return a promise.
     *
     * @param {Object} ret
     * @return {Promise}
     * @api private
     */

    function next(ret) {
      if (ret.done) return resolve(ret.value);
      var value = toPromise.call(ctx, ret.value);
      if (value && isPromise(value)) return value.then(onFulfilled, onRejected);
      return onRejected(new TypeError('You may only yield a function, promise, generator, array, or object, '
        + 'but the following object was passed: "' + String(ret.value) + '"'));
    }
  });
}

/**
 * Convert a `yield`ed value into a promise.
 *
 * @param {Mixed} obj
 * @return {Promise}
 * @api private
 */

function toPromise(obj) {
  if (!obj) return obj;
  if (isPromise(obj)) return obj;
  if (isGeneratorFunction(obj) || isGenerator(obj)) return co.call(this, obj);
  if ('function' == typeof obj) return thunkToPromise.call(this, obj);
  if (Array.isArray(obj)) return arrayToPromise.call(this, obj);
  if (isObject(obj)) return objectToPromise.call(this, obj);
  return obj;
}

/**
 * Convert a thunk to a promise.
 *
 * @param {Function}
 * @return {Promise}
 * @api private
 */

function thunkToPromise(fn) {
  var ctx = this;
  return new Promise(function (resolve, reject) {
    fn.call(ctx, function (err, res) {
      if (err) return reject(err);
      if (arguments.length > 2) res = slice.call(arguments, 1);
      resolve(res);
    });
  });
}

/**
 * Convert an array of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Array} obj
 * @return {Promise}
 * @api private
 */

function arrayToPromise(obj) {
  return Promise.all(obj.map(toPromise, this));
}

/**
 * Convert an object of "yieldables" to a promise.
 * Uses `Promise.all()` internally.
 *
 * @param {Object} obj
 * @return {Promise}
 * @api private
 */

function objectToPromise(obj){
  var results = new obj.constructor();
  var keys = Object.keys(obj);
  var promises = [];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var promise = toPromise.call(this, obj[key]);
    if (promise && isPromise(promise)) defer(promise, key);
    else results[key] = obj[key];
  }
  return Promise.all(promises).then(function () {
    return results;
  });

  function defer(promise, key) {
    // predefine the key in the result
    results[key] = undefined;
    promises.push(promise.then(function (res) {
      results[key] = res;
    }));
  }
}

/**
 * Check if `obj` is a promise.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isPromise(obj) {
  return 'function' == typeof obj.then;
}

/**
 * Check if `obj` is a generator.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */

function isGenerator(obj) {
  return 'function' == typeof obj.next && 'function' == typeof obj.throw;
}

/**
 * Check if `obj` is a generator function.
 *
 * @param {Mixed} obj
 * @return {Boolean}
 * @api private
 */
function isGeneratorFunction(obj) {
  var constructor = obj.constructor;
  if (!constructor) return false;
  if ('GeneratorFunction' === constructor.name || 'GeneratorFunction' === constructor.displayName) return true;
  return isGenerator(constructor.prototype);
}

/**
 * Check for plain object.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api private
 */

function isObject(val) {
  return Object == val.constructor;
}

},{}],2:[function(require,module,exports){
'use strict';

const win32 = require('./win32');

const appx = require('./appx');

const co = require('co');

const nullptr = NULL;
rpc.exports = {
  getPackageFullName: () => {
    return co(function* () {
      return yield Promise.resolve(appx.getPackageFullNameForProcess(win32.getCurrentProcessLimited()));
    });
  },
  dumpPackageContentsInto: to => {
    return co(function* () {
      const from = `${appx.getWindowsAppsPath()}\\${appx.getPackageFullNameForProcess(win32.getCurrentProcessLimited())}\\*.*`;
      return yield dumpPackageContents(from, to);
    });
  }
};

function dumpPackageContents(from, to) {
  return co(function* () {
    function* itemsIn(directory) {
      const structSize = win32.WIN32_FIND_DATA.size();
      const structPtr = Memory.alloc(structSize);

      for (let i = 0; i < structSize; i++) Memory.writeU8(structPtr.add(i), 0);

      const directoryPtr = Memory.allocUtf16String(directory);
      const handle = win32.findFirstFile(directoryPtr, structPtr); // Skip: .

      win32.findNextFile(handle, structPtr); // Skip: ..

      while (win32.findNextFile(handle, structPtr) > 0) {
        yield new win32.WIN32_FIND_DATA(structPtr);
      }
    }

    for (let itemFound of itemsIn(from)) {
      const fullSrcPath = `${from.substring(0, from.lastIndexOf('\\'))}\\${itemFound.fileName}`;
      const fullDstPath = `${to}\\${itemFound.fileName}`;

      if (itemFound.isDirectory) {
        yield dumpPackageContents(`${fullSrcPath}\\*.*`, fullDstPath);
      } else {
        yield dumpPackageItem(fullSrcPath, fullDstPath, itemFound.fileSize);
      }
    }
  });
}

function dumpPackageItem(from, to, bytecount) {
  return co(function* () {
    const fromPtr = Memory.allocUtf16String(from);
    const fileHandle = win32.createFile(fromPtr, win32.access.read, win32.share.read, nullptr, win32.disposition.openExisting, 0, nullptr);
    const fileStream = new Win32InputStream(fileHandle);
    const toWithoutFileName = to.substring(0, to.lastIndexOf('\\'));
    win32.shCreateDirectoryEx(nullptr, Memory.allocUtf16String(toWithoutFileName), nullptr);
    const buffer = yield fileStream.read(bytecount);
    send({
      type: 'progress',
      path: to
    });

    try {
      const file = new File(to, 'wb');
      file.write(buffer);
      file.close();
    } catch (error) {
      yield Promise.reject(error);
    }
  });
}

},{"./appx":3,"./win32":4,"co":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPackageFullNameForProcess = getPackageFullNameForProcess;
exports.getWindowsAppsPath = getWindowsAppsPath;

const win32 = require('./win32');

const getPackageFullName = exports.getPackageFullName = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetPackageFullName'), 'long', ['int', 'pointer', 'pointer']);

function getPackageFullNameForProcess(processHandle) {
  const PACKAGE_FULL_NAME_MAX_LENGTH = 127;
  const APPMODEL_ERROR_NO_PACKAGE = 15700;
  const SUCCESS = 0;
  const packageFullNameLengthPtr = Memory.alloc(Process.pointerSize);
  Memory.writeUInt(packageFullNameLengthPtr, PACKAGE_FULL_NAME_MAX_LENGTH);
  const packageFullNamePtr = Memory.alloc(PACKAGE_FULL_NAME_MAX_LENGTH);
  let packageFullName = '';
  let result = getPackageFullName(processHandle, packageFullNameLengthPtr, packageFullNamePtr);

  if (result == SUCCESS) {
    packageFullName = Memory.readUtf16String(packageFullNamePtr);
  } else {
    console.debug(`GetPackageFullName failed (return: ${result})`);
  }

  return packageFullName;
}

function getWindowsAppsPath() {
  // BUGBUG: Apps can be installed on other drives
  // https://gitlab.com/WithinRafael/anzu/issues/1
  const pathWithVarsPtr = Memory.allocUtf16String('%ProgramW6432%\\WindowsApps');
  const pathWithoutVarsPtr = Memory.alloc(win32.maxPath);
  win32.expandEnvironmentStrings(pathWithVarsPtr, pathWithoutVarsPtr, win32.maxPath);
  return Memory.readUtf16String(pathWithoutVarsPtr);
}

},{"./win32":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getCurrentProcessLimited = getCurrentProcessLimited;
const expandEnvironmentStrings = exports.expandEnvironmentStrings = new NativeFunction(Module.findExportByName('kernel32.dll', 'ExpandEnvironmentStringsW'), 'uint', ['pointer', 'pointer', 'uint']);
const getCurrentProcess = exports.getCurrentProcess = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetCurrentProcess'), 'int', []);
const findFirstFile = exports.findFirstFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindFirstFileW'), 'pointer', ['pointer', 'pointer']);
const findNextFile = exports.findNextFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindNextFileW'), 'int', ['pointer', 'pointer']);
const findClose = exports.findClose = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindClose'), 'int', ['pointer']);
const createFile = exports.createFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'CreateFileW'), 'pointer', ['pointer', 'uint', 'uint', 'pointer', 'uint', 'uint', 'pointer']);
const shCreateDirectoryEx = exports.shCreateDirectoryEx = new NativeFunction(Module.findExportByName('shell32.dll', 'SHCreateDirectoryExW'), 'int', ['pointer', 'pointer', 'pointer']);
const openProcess = exports.openProcess = new NativeFunction(Module.findExportByName('kernel32.dll', 'OpenProcess'), 'uint', ['uint', 'uint', 'uint']);
const getCurrentProcessId = exports.getCurrentProcessId = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetCurrentProcessId'), 'uint', []);

function getCurrentProcessLimited() {
  return openProcess(desiredAccess.processQueryLimitedInformation, 0, getCurrentProcessId());
} // minwinbase.h


class WIN32_FIND_DATA {
  static size() {
    return 592;
  }

  constructor(pointer) {
    this.fileAttributes = Memory.readUInt(pointer);
    this.isDirectory = (this.fileAttributes & 16) === 16;
    this.isFile = !this.isDirectory;
    this.creationTime = {};
    this.creationTime.low = Memory.readUInt(pointer.add(4));
    this.creationTime.high = Memory.readUInt(pointer.add(8));
    this.accessTime = {};
    this.accessTime.low = Memory.readUInt(pointer.add(12));
    this.accessTime.high = Memory.readUInt(pointer.add(16));
    this.writeTime = {};
    this.writeTime.low = Memory.readUInt(pointer.add(20));
    this.writeTime.high = Memory.readUInt(pointer.add(24));
    this.fileSize = {};
    this.fileSize.high = Memory.readUInt(pointer.add(28));
    this.fileSize.low = Memory.readUInt(pointer.add(32));
    var scratch = Memory.alloc(8);
    Memory.writeInt(scratch, this.fileSize.low);
    Memory.writeInt(scratch.add(4), this.fileSize.high);
    this.fileSize = Memory.readU64(scratch);
    this.fileName = Memory.readUtf16String(pointer.add(44));
    this.alternateFileName = Memory.readUtf16String(pointer.add(48));
  }

}

exports.WIN32_FIND_DATA = WIN32_FIND_DATA; // minwindef.h

const maxPath = exports.maxPath = 260; // winnt.h

const access = exports.access = {
  read: 0x80000000,
  write: 0x40000000,
  execute: 0x20000000,
  all: 0x10000000
};
const share = exports.share = {
  read: 0x00000001,
  write: 0x00000002,
  delete: 0x00000004
};
const disposition = exports.disposition = {
  createNew: 1,
  createAlways: 2,
  openExisting: 3,
  openAlways: 4,
  truncateExisting: 5
};
const desiredAccess = exports.desiredAccess = {
  processQueryLimitedInformation: 0x1000
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvY28vaW5kZXguanMiLCJzcmMvYWdlbnQuanMiLCJzcmMvYXBweC5qcyIsInNyYy93aW4zMi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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RVA7O0FBQ08sTUFBTSxNQUFNLFdBQU4sTUFBTSxHQUFHO0FBQ2xCLEVBQUEsSUFBSSxFQUFFLFVBRFk7QUFFbEIsRUFBQSxLQUFLLEVBQUUsVUFGVztBQUdsQixFQUFBLE9BQU8sRUFBRSxVQUhTO0FBSWxCLEVBQUEsR0FBRyxFQUFFO0FBSmEsQ0FBZjtBQU9BLE1BQU0sS0FBSyxXQUFMLEtBQUssR0FBRztBQUNqQixFQUFBLElBQUksRUFBRSxVQURXO0FBRWpCLEVBQUEsS0FBSyxFQUFFLFVBRlU7QUFHakIsRUFBQSxNQUFNLEVBQUU7QUFIUyxDQUFkO0FBTUEsTUFBTSxXQUFXLFdBQVgsV0FBVyxHQUFHO0FBQ3ZCLEVBQUEsU0FBUyxFQUFFLENBRFk7QUFFdkIsRUFBQSxZQUFZLEVBQUUsQ0FGUztBQUd2QixFQUFBLFlBQVksRUFBRSxDQUhTO0FBSXZCLEVBQUEsVUFBVSxFQUFFLENBSlc7QUFLdkIsRUFBQSxnQkFBZ0IsRUFBRTtBQUxLLENBQXBCO0FBUUEsTUFBTSxhQUFhLFdBQWIsYUFBYSxHQUFHO0FBQ3pCLEVBQUEsOEJBQThCLEVBQUU7QUFEUCxDQUF0QiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIn0=
