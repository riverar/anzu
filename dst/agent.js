(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

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

var win32 = require('./win32');
var appx = require('./appx');
var co = require('co');
var nullptr = NULL;

rpc.exports = {
  getPackageFullName: function getPackageFullName() {
    return co(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return Promise.resolve(appx.getPackageFullNameForProcess(win32.getCurrentProcess()));

            case 2:
              return _context.abrupt('return', _context.sent);

            case 3:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));
  },

  dumpPackageContentsInto: function dumpPackageContentsInto(to) {
    return co(regeneratorRuntime.mark(function _callee2() {
      var from;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              from = appx.getWindowsAppsPath() + '\\' + appx.getPackageFullNameForProcess(win32.getCurrentProcess()) + '\\*.*';
              _context2.next = 3;
              return dumpPackageContents(from, to);

            case 3:
              return _context2.abrupt('return', _context2.sent);

            case 4:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this);
    }));
  }
};

function dumpPackageContents(from, to) {
  return co(regeneratorRuntime.mark(function _callee3() {
    var _marked, itemsIn, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, itemFound, fullSrcPath, fullDstPath;

    return regeneratorRuntime.wrap(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            itemsIn = function itemsIn(directory) {
              var structSize, structPtr, i, directoryPtr, handle;
              return regeneratorRuntime.wrap(function itemsIn$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      structSize = win32.WIN32_FIND_DATA.size();
                      structPtr = Memory.alloc(structSize);

                      for (i = 0; i < structSize; i++) {
                        Memory.writeU8(structPtr.add(i), 0);
                      }directoryPtr = Memory.allocUtf16String(directory);
                      handle = win32.findFirstFile(directoryPtr, structPtr); // Skip: .

                      win32.findNextFile(handle, structPtr); // Skip: ..

                    case 6:
                      if (!(win32.findNextFile(handle, structPtr) > 0)) {
                        _context3.next = 11;
                        break;
                      }

                      _context3.next = 9;
                      return new win32.WIN32_FIND_DATA(structPtr);

                    case 9:
                      _context3.next = 6;
                      break;

                    case 11:
                    case 'end':
                      return _context3.stop();
                  }
                }
              }, _marked[0], this);
            };

            _marked = [itemsIn].map(regeneratorRuntime.mark);
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context4.prev = 5;
            _iterator = itemsIn(from)[Symbol.iterator]();

          case 7:
            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
              _context4.next = 21;
              break;
            }

            itemFound = _step.value;
            fullSrcPath = from.substring(0, from.lastIndexOf('\\')) + '\\' + itemFound.fileName;
            fullDstPath = to + '\\' + itemFound.fileName;

            if (!itemFound.isDirectory) {
              _context4.next = 16;
              break;
            }

            _context4.next = 14;
            return dumpPackageContents(fullSrcPath + '\\*.*', fullDstPath);

          case 14:
            _context4.next = 18;
            break;

          case 16:
            _context4.next = 18;
            return dumpPackageItem(fullSrcPath, fullDstPath, itemFound.fileSize);

          case 18:
            _iteratorNormalCompletion = true;
            _context4.next = 7;
            break;

          case 21:
            _context4.next = 27;
            break;

          case 23:
            _context4.prev = 23;
            _context4.t0 = _context4['catch'](5);
            _didIteratorError = true;
            _iteratorError = _context4.t0;

          case 27:
            _context4.prev = 27;
            _context4.prev = 28;

            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }

          case 30:
            _context4.prev = 30;

            if (!_didIteratorError) {
              _context4.next = 33;
              break;
            }

            throw _iteratorError;

          case 33:
            return _context4.finish(30);

          case 34:
            return _context4.finish(27);

          case 35:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee3, this, [[5, 23, 27, 35], [28,, 30, 34]]);
  }));
}

function dumpPackageItem(from, to, bytecount) {
  return co(regeneratorRuntime.mark(function _callee4() {
    var fromPtr, fileHandle, fileStream, toWithoutFileName, buffer, file;
    return regeneratorRuntime.wrap(function _callee4$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            fromPtr = Memory.allocUtf16String(from);
            fileHandle = win32.createFile(fromPtr, win32.access.read, win32.share.read, nullptr, win32.disposition.openExisting, 0, nullptr);
            fileStream = new Win32InputStream(fileHandle);
            toWithoutFileName = to.substring(0, to.lastIndexOf('\\'));

            win32.shCreateDirectoryEx(nullptr, Memory.allocUtf16String(toWithoutFileName), nullptr);

            _context5.next = 7;
            return fileStream.read(bytecount);

          case 7:
            buffer = _context5.sent;

            send({ type: 'progress', path: to });

            _context5.prev = 9;
            file = new File(to, 'wb');

            file.write(buffer);
            file.close();
            _context5.next = 19;
            break;

          case 15:
            _context5.prev = 15;
            _context5.t0 = _context5['catch'](9);
            _context5.next = 19;
            return Promise.reject(_context5.t0);

          case 19:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee4, this, [[9, 15]]);
  }));
}

},{"./appx":3,"./win32":4,"co":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getPackageFullNameForProcess = getPackageFullNameForProcess;
exports.getWindowsAppsPath = getWindowsAppsPath;
var win32 = require('./win32');

var getPackageFullName = exports.getPackageFullName = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetPackageFullName'), 'long', ['int', 'pointer', 'pointer']);

function getPackageFullNameForProcess(processHandle) {
    var PACKAGE_FULL_NAME_MAX_LENGTH = 127;
    var APPMODEL_ERROR_NO_PACKAGE = 15700;
    var SUCCESS = 0;

    var packageFullNameLengthPtr = Memory.alloc(Process.pointerSize);
    Memory.writeUInt(packageFullNameLengthPtr, PACKAGE_FULL_NAME_MAX_LENGTH);

    var packageFullNamePtr = Memory.alloc(PACKAGE_FULL_NAME_MAX_LENGTH);

    var packageFullName = '';
    if (getPackageFullName(processHandle, packageFullNameLengthPtr, packageFullNamePtr) == SUCCESS) {
        packageFullName = Memory.readUtf16String(packageFullNamePtr);
    }

    return packageFullName;
}

function getWindowsAppsPath() {
    // BUGBUG: Apps can be installed on other drives
    // https://gitlab.com/WithinRafael/anzu/issues/1
    var pathWithVarsPtr = Memory.allocUtf16String('%ProgramFiles%\\WindowsApps');
    var pathWithoutVarsPtr = Memory.alloc(win32.maxPath);
    win32.expandEnvironmentStrings(pathWithVarsPtr, pathWithoutVarsPtr, win32.maxPath);

    return Memory.readUtf16String(pathWithoutVarsPtr);
}

},{"./win32":4}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);
        }
    }return function (Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;
    };
}();

function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var expandEnvironmentStrings = exports.expandEnvironmentStrings = new NativeFunction(Module.findExportByName('kernel32.dll', 'ExpandEnvironmentStringsW'), 'uint', ['pointer', 'pointer', 'uint']);
var getCurrentProcess = exports.getCurrentProcess = new NativeFunction(Module.findExportByName('kernel32.dll', 'GetCurrentProcess'), 'int', []);
var findFirstFile = exports.findFirstFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindFirstFileW'), 'pointer', ['pointer', 'pointer']);
var findNextFile = exports.findNextFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindNextFileW'), 'int', ['pointer', 'pointer']);
var findClose = exports.findClose = new NativeFunction(Module.findExportByName('kernel32.dll', 'FindClose'), 'int', ['pointer']);
var createFile = exports.createFile = new NativeFunction(Module.findExportByName('kernel32.dll', 'CreateFileW'), 'pointer', ['pointer', 'uint', 'uint', 'pointer', 'uint', 'uint', 'pointer']);
var shCreateDirectoryEx = exports.shCreateDirectoryEx = new NativeFunction(Module.findExportByName('shell32.dll', 'SHCreateDirectoryExW'), 'int', ['pointer', 'pointer', 'pointer']);

// minwinbase.h

var WIN32_FIND_DATA = exports.WIN32_FIND_DATA = function () {
    _createClass(WIN32_FIND_DATA, null, [{
        key: 'size',
        value: function size() {
            return 592;
        }
    }]);

    function WIN32_FIND_DATA(pointer) {
        _classCallCheck(this, WIN32_FIND_DATA);

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

    return WIN32_FIND_DATA;
}();

// minwindef.h


var maxPath = exports.maxPath = 260;

// winnt.h
var access = exports.access = {
    read: 0x80000000,
    write: 0x40000000,
    execute: 0x20000000,
    all: 0x10000000
};

var share = exports.share = {
    read: 0x00000001,
    write: 0x00000002,
    delete: 0x00000004
};

var disposition = exports.disposition = {
    createNew: 1,
    createAlways: 2,
    openExisting: 3,
    openAlways: 4,
    truncateExisting: 5
};

},{}]},{},[2])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY28vaW5kZXguanMiLCJDOlxcU291cmNlc1xcYW56dVxcc3JjXFxhZ2VudC5qcyIsIkM6XFxTb3VyY2VzXFxhbnp1XFxzcmNcXGFwcHguanMiLCJDOlxcU291cmNlc1xcYW56dVxcc3JjXFx3aW4zMi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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UUFBdkIsQUFBZ0IsQUFBZSxBQUUvQjs7YUFBQSxBQUFLLFdBQVcsT0FBQSxBQUFPLGdCQUFnQixRQUFBLEFBQVEsSUFBL0MsQUFBZ0IsQUFBdUIsQUFBWSxBQUNuRDthQUFBLEFBQUssb0JBQW9CLE9BQUEsQUFBTyxnQkFBZ0IsUUFBQSxBQUFRLElBQXhELEFBQXlCLEFBQXVCLEFBQVksQUFDL0Q7Ozs7OztBQUdMOzs7QUFDTyxJQUFNLDRCQUFOLEFBQWdCOztBQUV2QjtBQUNPLElBQU07VUFBUyxBQUNaLEFBQ047V0FGa0IsQUFFWCxBQUNQO2FBSGtCLEFBR1QsQUFDVDtTQUpHLEFBQWUsQUFJYjtBQUphLEFBQ2xCOztBQU1HLElBQU07VUFBUSxBQUNYLEFBQ047V0FGaUIsQUFFVixBQUNQO1lBSEcsQUFBYyxBQUdUO0FBSFMsQUFDakI7O0FBS0csSUFBTTtlQUFjLEFBQ1osQUFDWDtrQkFGdUIsQUFFVCxBQUNkO2tCQUh1QixBQUdULEFBQ2Q7Z0JBSnVCLEFBSVgsQUFDWjtzQkFMRyxBQUFvQixBQUtMO0FBTEssQUFDdkIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiJ9
