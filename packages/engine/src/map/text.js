(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw ((f.code = "MODULE_NOT_FOUND"), f);
      }
      var l = (n[o] = { exports: {} });
      t[o][0].call(
        l.exports,
        function(e) {
          var n = t[o][1][e];
          return s(n ? n : e);
        },
        l,
        l.exports,
        e,
        t,
        n,
        r
      );
    }
    return n[o].exports;
  }
  var i = typeof require == "function" && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
})(
  {
    1: [
      function(require, module, exports) {
        "use strict";

        exports.byteLength = byteLength;
        exports.toByteArray = toByteArray;
        exports.fromByteArray = fromByteArray;

        var lookup = [];
        var revLookup = [];
        var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

        var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        for (var i = 0, len = code.length; i < len; ++i) {
          lookup[i] = code[i];
          revLookup[code.charCodeAt(i)] = i;
        }

        revLookup["-".charCodeAt(0)] = 62;
        revLookup["_".charCodeAt(0)] = 63;

        function placeHoldersCount(b64) {
          var len = b64.length;
          if (len % 4 > 0) {
            throw new Error("Invalid string. Length must be a multiple of 4");
          }

          // the number of equal signs (place holders)
          // if there are two placeholders, than the two characters before it
          // represent one byte
          // if there is only one, then the three characters before it represent 2 bytes
          // this is just a cheap hack to not do indexOf twice
          return b64[len - 2] === "=" ? 2 : b64[len - 1] === "=" ? 1 : 0;
        }

        function byteLength(b64) {
          // base64 is 4/3 + up to two characters of the original data
          return b64.length * 3 / 4 - placeHoldersCount(b64);
        }

        function toByteArray(b64) {
          var i, j, l, tmp, placeHolders, arr;
          var len = b64.length;
          placeHolders = placeHoldersCount(b64);

          arr = new Arr(len * 3 / 4 - placeHolders);

          // if there are placeholders, only get up to the last complete 4 chars
          l = placeHolders > 0 ? len - 4 : len;

          var L = 0;

          for (i = 0, j = 0; i < l; i += 4, j += 3) {
            tmp =
              (revLookup[b64.charCodeAt(i)] << 18) |
              (revLookup[b64.charCodeAt(i + 1)] << 12) |
              (revLookup[b64.charCodeAt(i + 2)] << 6) |
              revLookup[b64.charCodeAt(i + 3)];
            arr[L++] = (tmp >> 16) & 0xff;
            arr[L++] = (tmp >> 8) & 0xff;
            arr[L++] = tmp & 0xff;
          }

          if (placeHolders === 2) {
            tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
            arr[L++] = tmp & 0xff;
          } else if (placeHolders === 1) {
            tmp =
              (revLookup[b64.charCodeAt(i)] << 10) |
              (revLookup[b64.charCodeAt(i + 1)] << 4) |
              (revLookup[b64.charCodeAt(i + 2)] >> 2);
            arr[L++] = (tmp >> 8) & 0xff;
            arr[L++] = tmp & 0xff;
          }

          return arr;
        }

        function tripletToBase64(num) {
          return (
            lookup[(num >> 18) & 0x3f] + lookup[(num >> 12) & 0x3f] + lookup[(num >> 6) & 0x3f] + lookup[num & 0x3f]
          );
        }

        function encodeChunk(uint8, start, end) {
          var tmp;
          var output = [];
          for (var i = start; i < end; i += 3) {
            tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
            output.push(tripletToBase64(tmp));
          }
          return output.join("");
        }

        function fromByteArray(uint8) {
          var tmp;
          var len = uint8.length;
          var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
          var output = "";
          var parts = [];
          var maxChunkLength = 16383; // must be multiple of 3

          // go through the array every three bytes, we'll deal with trailing stuff later
          for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
            parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
          }

          // pad the end with zeros, but make sure to not forget the extra bytes
          if (extraBytes === 1) {
            tmp = uint8[len - 1];
            output += lookup[tmp >> 2];
            output += lookup[(tmp << 4) & 0x3f];
            output += "==";
          } else if (extraBytes === 2) {
            tmp = (uint8[len - 2] << 8) + uint8[len - 1];
            output += lookup[tmp >> 10];
            output += lookup[(tmp >> 4) & 0x3f];
            output += lookup[(tmp << 2) & 0x3f];
            output += "=";
          }

          parts.push(output);

          return parts.join("");
        }
      },
      {}
    ],
    2: [
      function(require, module, exports) {
        (function(global) {
          /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
          /* eslint-disable no-proto */

          "use strict";

          var base64 = require("base64-js");
          var ieee754 = require("ieee754");
          var isArray = require("isarray");

          exports.Buffer = Buffer;
          exports.SlowBuffer = SlowBuffer;
          exports.INSPECT_MAX_BYTES = 50;

          /**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
          Buffer.TYPED_ARRAY_SUPPORT =
            global.TYPED_ARRAY_SUPPORT !== undefined ? global.TYPED_ARRAY_SUPPORT : typedArraySupport();

          /*
 * Export kMaxLength after typed array support is determined.
 */
          exports.kMaxLength = kMaxLength();

          function typedArraySupport() {
            try {
              var arr = new Uint8Array(1);
              arr.__proto__ = {
                __proto__: Uint8Array.prototype,
                foo: function() {
                  return 42;
                }
              };
              return (
                arr.foo() === 42 && // typed array instances can be augmented
                typeof arr.subarray === "function" && // chrome 9-10 lack `subarray`
                arr.subarray(1, 1).byteLength === 0
              ); // ie10 has broken `subarray`
            } catch (e) {
              return false;
            }
          }

          function kMaxLength() {
            return Buffer.TYPED_ARRAY_SUPPORT ? 0x7fffffff : 0x3fffffff;
          }

          function createBuffer(that, length) {
            if (kMaxLength() < length) {
              throw new RangeError("Invalid typed array length");
            }
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              // Return an augmented `Uint8Array` instance, for best performance
              that = new Uint8Array(length);
              that.__proto__ = Buffer.prototype;
            } else {
              // Fallback: Return an object instance of the Buffer class
              if (that === null) {
                that = new Buffer(length);
              }
              that.length = length;
            }

            return that;
          }

          /**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

          function Buffer(arg, encodingOrOffset, length) {
            if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
              return new Buffer(arg, encodingOrOffset, length);
            }

            // Common case.
            if (typeof arg === "number") {
              if (typeof encodingOrOffset === "string") {
                throw new Error("If encoding is specified then the first argument must be a string");
              }
              return allocUnsafe(this, arg);
            }
            return from(this, arg, encodingOrOffset, length);
          }

          Buffer.poolSize = 8192; // not used by this implementation

          // TODO: Legacy, not needed anymore. Remove in next major version.
          Buffer._augment = function(arr) {
            arr.__proto__ = Buffer.prototype;
            return arr;
          };

          function from(that, value, encodingOrOffset, length) {
            if (typeof value === "number") {
              throw new TypeError('"value" argument must not be a number');
            }

            if (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) {
              return fromArrayBuffer(that, value, encodingOrOffset, length);
            }

            if (typeof value === "string") {
              return fromString(that, value, encodingOrOffset);
            }

            return fromObject(that, value);
          }

          /**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
          Buffer.from = function(value, encodingOrOffset, length) {
            return from(null, value, encodingOrOffset, length);
          };

          if (Buffer.TYPED_ARRAY_SUPPORT) {
            Buffer.prototype.__proto__ = Uint8Array.prototype;
            Buffer.__proto__ = Uint8Array;
            if (typeof Symbol !== "undefined" && Symbol.species && Buffer[Symbol.species] === Buffer) {
              // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
              Object.defineProperty(Buffer, Symbol.species, {
                value: null,
                configurable: true
              });
            }
          }

          function assertSize(size) {
            if (typeof size !== "number") {
              throw new TypeError('"size" argument must be a number');
            } else if (size < 0) {
              throw new RangeError('"size" argument must not be negative');
            }
          }

          function alloc(that, size, fill, encoding) {
            assertSize(size);
            if (size <= 0) {
              return createBuffer(that, size);
            }
            if (fill !== undefined) {
              // Only pay attention to encoding if it's a string. This
              // prevents accidentally sending in a number that would
              // be interpretted as a start offset.
              return typeof encoding === "string"
                ? createBuffer(that, size).fill(fill, encoding)
                : createBuffer(that, size).fill(fill);
            }
            return createBuffer(that, size);
          }

          /**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
          Buffer.alloc = function(size, fill, encoding) {
            return alloc(null, size, fill, encoding);
          };

          function allocUnsafe(that, size) {
            assertSize(size);
            that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
            if (!Buffer.TYPED_ARRAY_SUPPORT) {
              for (var i = 0; i < size; ++i) {
                that[i] = 0;
              }
            }
            return that;
          }

          /**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
          Buffer.allocUnsafe = function(size) {
            return allocUnsafe(null, size);
          };
          /**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
          Buffer.allocUnsafeSlow = function(size) {
            return allocUnsafe(null, size);
          };

          function fromString(that, string, encoding) {
            if (typeof encoding !== "string" || encoding === "") {
              encoding = "utf8";
            }

            if (!Buffer.isEncoding(encoding)) {
              throw new TypeError('"encoding" must be a valid string encoding');
            }

            var length = byteLength(string, encoding) | 0;
            that = createBuffer(that, length);

            var actual = that.write(string, encoding);

            if (actual !== length) {
              // Writing a hex string, for example, that contains invalid characters will
              // cause everything after the first invalid character to be ignored. (e.g.
              // 'abxxcd' will be treated as 'ab')
              that = that.slice(0, actual);
            }

            return that;
          }

          function fromArrayLike(that, array) {
            var length = array.length < 0 ? 0 : checked(array.length) | 0;
            that = createBuffer(that, length);
            for (var i = 0; i < length; i += 1) {
              that[i] = array[i] & 255;
            }
            return that;
          }

          function fromArrayBuffer(that, array, byteOffset, length) {
            array.byteLength; // this throws if `array` is not a valid ArrayBuffer

            if (byteOffset < 0 || array.byteLength < byteOffset) {
              throw new RangeError("'offset' is out of bounds");
            }

            if (array.byteLength < byteOffset + (length || 0)) {
              throw new RangeError("'length' is out of bounds");
            }

            if (byteOffset === undefined && length === undefined) {
              array = new Uint8Array(array);
            } else if (length === undefined) {
              array = new Uint8Array(array, byteOffset);
            } else {
              array = new Uint8Array(array, byteOffset, length);
            }

            if (Buffer.TYPED_ARRAY_SUPPORT) {
              // Return an augmented `Uint8Array` instance, for best performance
              that = array;
              that.__proto__ = Buffer.prototype;
            } else {
              // Fallback: Return an object instance of the Buffer class
              that = fromArrayLike(that, array);
            }
            return that;
          }

          function fromObject(that, obj) {
            if (Buffer.isBuffer(obj)) {
              var len = checked(obj.length) | 0;
              that = createBuffer(that, len);

              if (that.length === 0) {
                return that;
              }

              obj.copy(that, 0, 0, len);
              return that;
            }

            if (obj) {
              if ((typeof ArrayBuffer !== "undefined" && obj.buffer instanceof ArrayBuffer) || "length" in obj) {
                if (typeof obj.length !== "number" || isnan(obj.length)) {
                  return createBuffer(that, 0);
                }
                return fromArrayLike(that, obj);
              }

              if (obj.type === "Buffer" && isArray(obj.data)) {
                return fromArrayLike(that, obj.data);
              }
            }

            throw new TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
          }

          function checked(length) {
            // Note: cannot use `length < kMaxLength()` here because that fails when
            // length is NaN (which is otherwise coerced to zero.)
            if (length >= kMaxLength()) {
              throw new RangeError(
                "Attempt to allocate Buffer larger than maximum " + "size: 0x" + kMaxLength().toString(16) + " bytes"
              );
            }
            return length | 0;
          }

          function SlowBuffer(length) {
            if (+length != length) {
              // eslint-disable-line eqeqeq
              length = 0;
            }
            return Buffer.alloc(+length);
          }

          Buffer.isBuffer = function isBuffer(b) {
            return !!(b != null && b._isBuffer);
          };

          Buffer.compare = function compare(a, b) {
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
              throw new TypeError("Arguments must be Buffers");
            }

            if (a === b) return 0;

            var x = a.length;
            var y = b.length;

            for (var i = 0, len = Math.min(x, y); i < len; ++i) {
              if (a[i] !== b[i]) {
                x = a[i];
                y = b[i];
                break;
              }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };

          Buffer.isEncoding = function isEncoding(encoding) {
            switch (String(encoding).toLowerCase()) {
              case "hex":
              case "utf8":
              case "utf-8":
              case "ascii":
              case "latin1":
              case "binary":
              case "base64":
              case "ucs2":
              case "ucs-2":
              case "utf16le":
              case "utf-16le":
                return true;
              default:
                return false;
            }
          };

          Buffer.concat = function concat(list, length) {
            if (!isArray(list)) {
              throw new TypeError('"list" argument must be an Array of Buffers');
            }

            if (list.length === 0) {
              return Buffer.alloc(0);
            }

            var i;
            if (length === undefined) {
              length = 0;
              for (i = 0; i < list.length; ++i) {
                length += list[i].length;
              }
            }

            var buffer = Buffer.allocUnsafe(length);
            var pos = 0;
            for (i = 0; i < list.length; ++i) {
              var buf = list[i];
              if (!Buffer.isBuffer(buf)) {
                throw new TypeError('"list" argument must be an Array of Buffers');
              }
              buf.copy(buffer, pos);
              pos += buf.length;
            }
            return buffer;
          };

          function byteLength(string, encoding) {
            if (Buffer.isBuffer(string)) {
              return string.length;
            }
            if (
              typeof ArrayBuffer !== "undefined" &&
              typeof ArrayBuffer.isView === "function" &&
              (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)
            ) {
              return string.byteLength;
            }
            if (typeof string !== "string") {
              string = "" + string;
            }

            var len = string.length;
            if (len === 0) return 0;

            // Use a for loop to avoid recursion
            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case "ascii":
                case "latin1":
                case "binary":
                  return len;
                case "utf8":
                case "utf-8":
                case undefined:
                  return utf8ToBytes(string).length;
                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return len * 2;
                case "hex":
                  return len >>> 1;
                case "base64":
                  return base64ToBytes(string).length;
                default:
                  if (loweredCase) return utf8ToBytes(string).length; // assume utf8
                  encoding = ("" + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          }
          Buffer.byteLength = byteLength;

          function slowToString(encoding, start, end) {
            var loweredCase = false;

            // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
            // property of a typed array.

            // This behaves neither like String nor Uint8Array in that we set start/end
            // to their upper/lower bounds if the value passed is out of range.
            // undefined is handled specially as per ECMA-262 6th Edition,
            // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
            if (start === undefined || start < 0) {
              start = 0;
            }
            // Return early if start > this.length. Done here to prevent potential uint32
            // coercion fail below.
            if (start > this.length) {
              return "";
            }

            if (end === undefined || end > this.length) {
              end = this.length;
            }

            if (end <= 0) {
              return "";
            }

            // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
            end >>>= 0;
            start >>>= 0;

            if (end <= start) {
              return "";
            }

            if (!encoding) encoding = "utf8";

            while (true) {
              switch (encoding) {
                case "hex":
                  return hexSlice(this, start, end);

                case "utf8":
                case "utf-8":
                  return utf8Slice(this, start, end);

                case "ascii":
                  return asciiSlice(this, start, end);

                case "latin1":
                case "binary":
                  return latin1Slice(this, start, end);

                case "base64":
                  return base64Slice(this, start, end);

                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return utf16leSlice(this, start, end);

                default:
                  if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                  encoding = (encoding + "").toLowerCase();
                  loweredCase = true;
              }
            }
          }

          // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
          // Buffer instances.
          Buffer.prototype._isBuffer = true;

          function swap(b, n, m) {
            var i = b[n];
            b[n] = b[m];
            b[m] = i;
          }

          Buffer.prototype.swap16 = function swap16() {
            var len = this.length;
            if (len % 2 !== 0) {
              throw new RangeError("Buffer size must be a multiple of 16-bits");
            }
            for (var i = 0; i < len; i += 2) {
              swap(this, i, i + 1);
            }
            return this;
          };

          Buffer.prototype.swap32 = function swap32() {
            var len = this.length;
            if (len % 4 !== 0) {
              throw new RangeError("Buffer size must be a multiple of 32-bits");
            }
            for (var i = 0; i < len; i += 4) {
              swap(this, i, i + 3);
              swap(this, i + 1, i + 2);
            }
            return this;
          };

          Buffer.prototype.swap64 = function swap64() {
            var len = this.length;
            if (len % 8 !== 0) {
              throw new RangeError("Buffer size must be a multiple of 64-bits");
            }
            for (var i = 0; i < len; i += 8) {
              swap(this, i, i + 7);
              swap(this, i + 1, i + 6);
              swap(this, i + 2, i + 5);
              swap(this, i + 3, i + 4);
            }
            return this;
          };

          Buffer.prototype.toString = function toString() {
            var length = this.length | 0;
            if (length === 0) return "";
            if (arguments.length === 0) return utf8Slice(this, 0, length);
            return slowToString.apply(this, arguments);
          };

          Buffer.prototype.equals = function equals(b) {
            if (!Buffer.isBuffer(b)) throw new TypeError("Argument must be a Buffer");
            if (this === b) return true;
            return Buffer.compare(this, b) === 0;
          };

          Buffer.prototype.inspect = function inspect() {
            var str = "";
            var max = exports.INSPECT_MAX_BYTES;
            if (this.length > 0) {
              str = this.toString("hex", 0, max).match(/.{2}/g).join(" ");
              if (this.length > max) str += " ... ";
            }
            return "<Buffer " + str + ">";
          };

          Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
            if (!Buffer.isBuffer(target)) {
              throw new TypeError("Argument must be a Buffer");
            }

            if (start === undefined) {
              start = 0;
            }
            if (end === undefined) {
              end = target ? target.length : 0;
            }
            if (thisStart === undefined) {
              thisStart = 0;
            }
            if (thisEnd === undefined) {
              thisEnd = this.length;
            }

            if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
              throw new RangeError("out of range index");
            }

            if (thisStart >= thisEnd && start >= end) {
              return 0;
            }
            if (thisStart >= thisEnd) {
              return -1;
            }
            if (start >= end) {
              return 1;
            }

            start >>>= 0;
            end >>>= 0;
            thisStart >>>= 0;
            thisEnd >>>= 0;

            if (this === target) return 0;

            var x = thisEnd - thisStart;
            var y = end - start;
            var len = Math.min(x, y);

            var thisCopy = this.slice(thisStart, thisEnd);
            var targetCopy = target.slice(start, end);

            for (var i = 0; i < len; ++i) {
              if (thisCopy[i] !== targetCopy[i]) {
                x = thisCopy[i];
                y = targetCopy[i];
                break;
              }
            }

            if (x < y) return -1;
            if (y < x) return 1;
            return 0;
          };

          // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
          // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
          //
          // Arguments:
          // - buffer - a Buffer to search
          // - val - a string, Buffer, or number
          // - byteOffset - an index into `buffer`; will be clamped to an int32
          // - encoding - an optional encoding, relevant is val is a string
          // - dir - true for indexOf, false for lastIndexOf
          function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
            // Empty buffer means no match
            if (buffer.length === 0) return -1;

            // Normalize byteOffset
            if (typeof byteOffset === "string") {
              encoding = byteOffset;
              byteOffset = 0;
            } else if (byteOffset > 0x7fffffff) {
              byteOffset = 0x7fffffff;
            } else if (byteOffset < -0x80000000) {
              byteOffset = -0x80000000;
            }
            byteOffset = +byteOffset; // Coerce to Number.
            if (isNaN(byteOffset)) {
              // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
              byteOffset = dir ? 0 : buffer.length - 1;
            }

            // Normalize byteOffset: negative offsets start from the end of the buffer
            if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
            if (byteOffset >= buffer.length) {
              if (dir) return -1;
              else byteOffset = buffer.length - 1;
            } else if (byteOffset < 0) {
              if (dir) byteOffset = 0;
              else return -1;
            }

            // Normalize val
            if (typeof val === "string") {
              val = Buffer.from(val, encoding);
            }

            // Finally, search either indexOf (if dir is true) or lastIndexOf
            if (Buffer.isBuffer(val)) {
              // Special case: looking for empty string/buffer always fails
              if (val.length === 0) {
                return -1;
              }
              return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
            } else if (typeof val === "number") {
              val = val & 0xff; // Search for a byte value [0-255]
              if (Buffer.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf === "function") {
                if (dir) {
                  return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
                } else {
                  return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
                }
              }
              return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
            }

            throw new TypeError("val must be string, number or Buffer");
          }

          function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
            var indexSize = 1;
            var arrLength = arr.length;
            var valLength = val.length;

            if (encoding !== undefined) {
              encoding = String(encoding).toLowerCase();
              if (encoding === "ucs2" || encoding === "ucs-2" || encoding === "utf16le" || encoding === "utf-16le") {
                if (arr.length < 2 || val.length < 2) {
                  return -1;
                }
                indexSize = 2;
                arrLength /= 2;
                valLength /= 2;
                byteOffset /= 2;
              }
            }

            function read(buf, i) {
              if (indexSize === 1) {
                return buf[i];
              } else {
                return buf.readUInt16BE(i * indexSize);
              }
            }

            var i;
            if (dir) {
              var foundIndex = -1;
              for (i = byteOffset; i < arrLength; i++) {
                if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
                  if (foundIndex === -1) foundIndex = i;
                  if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
                } else {
                  if (foundIndex !== -1) i -= i - foundIndex;
                  foundIndex = -1;
                }
              }
            } else {
              if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
              for (i = byteOffset; i >= 0; i--) {
                var found = true;
                for (var j = 0; j < valLength; j++) {
                  if (read(arr, i + j) !== read(val, j)) {
                    found = false;
                    break;
                  }
                }
                if (found) return i;
              }
            }

            return -1;
          }

          Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
            return this.indexOf(val, byteOffset, encoding) !== -1;
          };

          Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
          };

          Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
            return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
          };

          function hexWrite(buf, string, offset, length) {
            offset = Number(offset) || 0;
            var remaining = buf.length - offset;
            if (!length) {
              length = remaining;
            } else {
              length = Number(length);
              if (length > remaining) {
                length = remaining;
              }
            }

            // must be an even number of digits
            var strLen = string.length;
            if (strLen % 2 !== 0) throw new TypeError("Invalid hex string");

            if (length > strLen / 2) {
              length = strLen / 2;
            }
            for (var i = 0; i < length; ++i) {
              var parsed = parseInt(string.substr(i * 2, 2), 16);
              if (isNaN(parsed)) return i;
              buf[offset + i] = parsed;
            }
            return i;
          }

          function utf8Write(buf, string, offset, length) {
            return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
          }

          function asciiWrite(buf, string, offset, length) {
            return blitBuffer(asciiToBytes(string), buf, offset, length);
          }

          function latin1Write(buf, string, offset, length) {
            return asciiWrite(buf, string, offset, length);
          }

          function base64Write(buf, string, offset, length) {
            return blitBuffer(base64ToBytes(string), buf, offset, length);
          }

          function ucs2Write(buf, string, offset, length) {
            return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
          }

          Buffer.prototype.write = function write(string, offset, length, encoding) {
            // Buffer#write(string)
            if (offset === undefined) {
              encoding = "utf8";
              length = this.length;
              offset = 0;
              // Buffer#write(string, encoding)
            } else if (length === undefined && typeof offset === "string") {
              encoding = offset;
              length = this.length;
              offset = 0;
              // Buffer#write(string, offset[, length][, encoding])
            } else if (isFinite(offset)) {
              offset = offset | 0;
              if (isFinite(length)) {
                length = length | 0;
                if (encoding === undefined) encoding = "utf8";
              } else {
                encoding = length;
                length = undefined;
              }
              // legacy write(string, encoding, offset, length) - remove in v0.13
            } else {
              throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
            }

            var remaining = this.length - offset;
            if (length === undefined || length > remaining) length = remaining;

            if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
              throw new RangeError("Attempt to write outside buffer bounds");
            }

            if (!encoding) encoding = "utf8";

            var loweredCase = false;
            for (;;) {
              switch (encoding) {
                case "hex":
                  return hexWrite(this, string, offset, length);

                case "utf8":
                case "utf-8":
                  return utf8Write(this, string, offset, length);

                case "ascii":
                  return asciiWrite(this, string, offset, length);

                case "latin1":
                case "binary":
                  return latin1Write(this, string, offset, length);

                case "base64":
                  // Warning: maxLength not taken into account in base64Write
                  return base64Write(this, string, offset, length);

                case "ucs2":
                case "ucs-2":
                case "utf16le":
                case "utf-16le":
                  return ucs2Write(this, string, offset, length);

                default:
                  if (loweredCase) throw new TypeError("Unknown encoding: " + encoding);
                  encoding = ("" + encoding).toLowerCase();
                  loweredCase = true;
              }
            }
          };

          Buffer.prototype.toJSON = function toJSON() {
            return {
              type: "Buffer",
              data: Array.prototype.slice.call(this._arr || this, 0)
            };
          };

          function base64Slice(buf, start, end) {
            if (start === 0 && end === buf.length) {
              return base64.fromByteArray(buf);
            } else {
              return base64.fromByteArray(buf.slice(start, end));
            }
          }

          function utf8Slice(buf, start, end) {
            end = Math.min(buf.length, end);
            var res = [];

            var i = start;
            while (i < end) {
              var firstByte = buf[i];
              var codePoint = null;
              var bytesPerSequence = firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

              if (i + bytesPerSequence <= end) {
                var secondByte, thirdByte, fourthByte, tempCodePoint;

                switch (bytesPerSequence) {
                  case 1:
                    if (firstByte < 0x80) {
                      codePoint = firstByte;
                    }
                    break;
                  case 2:
                    secondByte = buf[i + 1];
                    if ((secondByte & 0xc0) === 0x80) {
                      tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
                      if (tempCodePoint > 0x7f) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 3:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
                      tempCodePoint = ((firstByte & 0xf) << 0xc) | ((secondByte & 0x3f) << 0x6) | (thirdByte & 0x3f);
                      if (tempCodePoint > 0x7ff && (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)) {
                        codePoint = tempCodePoint;
                      }
                    }
                    break;
                  case 4:
                    secondByte = buf[i + 1];
                    thirdByte = buf[i + 2];
                    fourthByte = buf[i + 3];
                    if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80 && (fourthByte & 0xc0) === 0x80) {
                      tempCodePoint =
                        ((firstByte & 0xf) << 0x12) |
                        ((secondByte & 0x3f) << 0xc) |
                        ((thirdByte & 0x3f) << 0x6) |
                        (fourthByte & 0x3f);
                      if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
                        codePoint = tempCodePoint;
                      }
                    }
                }
              }

              if (codePoint === null) {
                // we did not generate a valid codePoint so insert a
                // replacement char (U+FFFD) and advance only 1 byte
                codePoint = 0xfffd;
                bytesPerSequence = 1;
              } else if (codePoint > 0xffff) {
                // encode to utf16 (surrogate pair dance)
                codePoint -= 0x10000;
                res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
                codePoint = 0xdc00 | (codePoint & 0x3ff);
              }

              res.push(codePoint);
              i += bytesPerSequence;
            }

            return decodeCodePointsArray(res);
          }

          // Based on http://stackoverflow.com/a/22747272/680742, the browser with
          // the lowest limit is Chrome, with 0x10000 args.
          // We go 1 magnitude less, for safety
          var MAX_ARGUMENTS_LENGTH = 0x1000;

          function decodeCodePointsArray(codePoints) {
            var len = codePoints.length;
            if (len <= MAX_ARGUMENTS_LENGTH) {
              return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
            }

            // Decode in chunks to avoid "call stack size exceeded".
            var res = "";
            var i = 0;
            while (i < len) {
              res += String.fromCharCode.apply(String, codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH)));
            }
            return res;
          }

          function asciiSlice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i] & 0x7f);
            }
            return ret;
          }

          function latin1Slice(buf, start, end) {
            var ret = "";
            end = Math.min(buf.length, end);

            for (var i = start; i < end; ++i) {
              ret += String.fromCharCode(buf[i]);
            }
            return ret;
          }

          function hexSlice(buf, start, end) {
            var len = buf.length;

            if (!start || start < 0) start = 0;
            if (!end || end < 0 || end > len) end = len;

            var out = "";
            for (var i = start; i < end; ++i) {
              out += toHex(buf[i]);
            }
            return out;
          }

          function utf16leSlice(buf, start, end) {
            var bytes = buf.slice(start, end);
            var res = "";
            for (var i = 0; i < bytes.length; i += 2) {
              res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
            }
            return res;
          }

          Buffer.prototype.slice = function slice(start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;

            if (start < 0) {
              start += len;
              if (start < 0) start = 0;
            } else if (start > len) {
              start = len;
            }

            if (end < 0) {
              end += len;
              if (end < 0) end = 0;
            } else if (end > len) {
              end = len;
            }

            if (end < start) end = start;

            var newBuf;
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              newBuf = this.subarray(start, end);
              newBuf.__proto__ = Buffer.prototype;
            } else {
              var sliceLen = end - start;
              newBuf = new Buffer(sliceLen, undefined);
              for (var i = 0; i < sliceLen; ++i) {
                newBuf[i] = this[i + start];
              }
            }

            return newBuf;
          };

          /*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
          function checkOffset(offset, ext, length) {
            if (offset % 1 !== 0 || offset < 0) throw new RangeError("offset is not uint");
            if (offset + ext > length) throw new RangeError("Trying to access beyond buffer length");
          }

          Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }

            return val;
          };

          Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) {
              checkOffset(offset, byteLength, this.length);
            }

            var val = this[offset + --byteLength];
            var mul = 1;
            while (byteLength > 0 && (mul *= 0x100)) {
              val += this[offset + --byteLength] * mul;
            }

            return val;
          };

          Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 1, this.length);
            return this[offset];
          };

          Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            return this[offset] | (this[offset + 1] << 8);
          };

          Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            return (this[offset] << 8) | this[offset + 1];
          };

          Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);

            return (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) + this[offset + 3] * 0x1000000;
          };

          Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);

            return this[offset] * 0x1000000 + ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3]);
          };

          Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var val = this[offset];
            var mul = 1;
            var i = 0;
            while (++i < byteLength && (mul *= 0x100)) {
              val += this[offset + i] * mul;
            }
            mul *= 0x80;

            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

            return val;
          };

          Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) checkOffset(offset, byteLength, this.length);

            var i = byteLength;
            var mul = 1;
            var val = this[offset + --i];
            while (i > 0 && (mul *= 0x100)) {
              val += this[offset + --i] * mul;
            }
            mul *= 0x80;

            if (val >= mul) val -= Math.pow(2, 8 * byteLength);

            return val;
          };

          Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 1, this.length);
            if (!(this[offset] & 0x80)) return this[offset];
            return (0xff - this[offset] + 1) * -1;
          };

          Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset] | (this[offset + 1] << 8);
            return val & 0x8000 ? val | 0xffff0000 : val;
          };

          Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 2, this.length);
            var val = this[offset + 1] | (this[offset] << 8);
            return val & 0x8000 ? val | 0xffff0000 : val;
          };

          Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);

            return this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16) | (this[offset + 3] << 24);
          };

          Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);

            return (this[offset] << 24) | (this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3];
          };

          Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, true, 23, 4);
          };

          Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 4, this.length);
            return ieee754.read(this, offset, false, 23, 4);
          };

          Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, true, 52, 8);
          };

          Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
            if (!noAssert) checkOffset(offset, 8, this.length);
            return ieee754.read(this, offset, false, 52, 8);
          };

          function checkInt(buf, value, offset, ext, max, min) {
            if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
            if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
            if (offset + ext > buf.length) throw new RangeError("Index out of range");
          }

          Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }

            var mul = 1;
            var i = 0;
            this[offset] = value & 0xff;
            while (++i < byteLength && (mul *= 0x100)) {
              this[offset + i] = (value / mul) & 0xff;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            byteLength = byteLength | 0;
            if (!noAssert) {
              var maxBytes = Math.pow(2, 8 * byteLength) - 1;
              checkInt(this, value, offset, byteLength, maxBytes, 0);
            }

            var i = byteLength - 1;
            var mul = 1;
            this[offset + i] = value & 0xff;
            while (--i >= 0 && (mul *= 0x100)) {
              this[offset + i] = (value / mul) & 0xff;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
            if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
            this[offset] = value & 0xff;
            return offset + 1;
          };

          function objectWriteUInt16(buf, value, offset, littleEndian) {
            if (value < 0) value = 0xffff + value + 1;
            for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
              buf[offset + i] =
                (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>> ((littleEndian ? i : 1 - i) * 8);
            }
          }

          Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value & 0xff;
              this[offset + 1] = value >>> 8;
            } else {
              objectWriteUInt16(this, value, offset, true);
            }
            return offset + 2;
          };

          Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value >>> 8;
              this[offset + 1] = value & 0xff;
            } else {
              objectWriteUInt16(this, value, offset, false);
            }
            return offset + 2;
          };

          function objectWriteUInt32(buf, value, offset, littleEndian) {
            if (value < 0) value = 0xffffffff + value + 1;
            for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
              buf[offset + i] = (value >>> ((littleEndian ? i : 3 - i) * 8)) & 0xff;
            }
          }

          Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset + 3] = value >>> 24;
              this[offset + 2] = value >>> 16;
              this[offset + 1] = value >>> 8;
              this[offset] = value & 0xff;
            } else {
              objectWriteUInt32(this, value, offset, true);
            }
            return offset + 4;
          };

          Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value >>> 24;
              this[offset + 1] = value >>> 16;
              this[offset + 2] = value >>> 8;
              this[offset + 3] = value & 0xff;
            } else {
              objectWriteUInt32(this, value, offset, false);
            }
            return offset + 4;
          };

          Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);

              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }

            var i = 0;
            var mul = 1;
            var sub = 0;
            this[offset] = value & 0xff;
            while (++i < byteLength && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) {
              var limit = Math.pow(2, 8 * byteLength - 1);

              checkInt(this, value, offset, byteLength, limit - 1, -limit);
            }

            var i = byteLength - 1;
            var mul = 1;
            var sub = 0;
            this[offset + i] = value & 0xff;
            while (--i >= 0 && (mul *= 0x100)) {
              if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
                sub = 1;
              }
              this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
            }

            return offset + byteLength;
          };

          Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
            if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
            if (value < 0) value = 0xff + value + 1;
            this[offset] = value & 0xff;
            return offset + 1;
          };

          Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value & 0xff;
              this[offset + 1] = value >>> 8;
            } else {
              objectWriteUInt16(this, value, offset, true);
            }
            return offset + 2;
          };

          Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value >>> 8;
              this[offset + 1] = value & 0xff;
            } else {
              objectWriteUInt16(this, value, offset, false);
            }
            return offset + 2;
          };

          Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value & 0xff;
              this[offset + 1] = value >>> 8;
              this[offset + 2] = value >>> 16;
              this[offset + 3] = value >>> 24;
            } else {
              objectWriteUInt32(this, value, offset, true);
            }
            return offset + 4;
          };

          Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
            value = +value;
            offset = offset | 0;
            if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
            if (value < 0) value = 0xffffffff + value + 1;
            if (Buffer.TYPED_ARRAY_SUPPORT) {
              this[offset] = value >>> 24;
              this[offset + 1] = value >>> 16;
              this[offset + 2] = value >>> 8;
              this[offset + 3] = value & 0xff;
            } else {
              objectWriteUInt32(this, value, offset, false);
            }
            return offset + 4;
          };

          function checkIEEE754(buf, value, offset, ext, max, min) {
            if (offset + ext > buf.length) throw new RangeError("Index out of range");
            if (offset < 0) throw new RangeError("Index out of range");
          }

          function writeFloat(buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 4, 3.4028234663852886e38, -3.4028234663852886e38);
            }
            ieee754.write(buf, value, offset, littleEndian, 23, 4);
            return offset + 4;
          }

          Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
            return writeFloat(this, value, offset, true, noAssert);
          };

          Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
            return writeFloat(this, value, offset, false, noAssert);
          };

          function writeDouble(buf, value, offset, littleEndian, noAssert) {
            if (!noAssert) {
              checkIEEE754(buf, value, offset, 8, 1.7976931348623157e308, -1.7976931348623157e308);
            }
            ieee754.write(buf, value, offset, littleEndian, 52, 8);
            return offset + 8;
          }

          Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
            return writeDouble(this, value, offset, true, noAssert);
          };

          Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
            return writeDouble(this, value, offset, false, noAssert);
          };

          // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
          Buffer.prototype.copy = function copy(target, targetStart, start, end) {
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;

            // Copy 0 bytes; we're done
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;

            // Fatal error conditions
            if (targetStart < 0) {
              throw new RangeError("targetStart out of bounds");
            }
            if (start < 0 || start >= this.length) throw new RangeError("sourceStart out of bounds");
            if (end < 0) throw new RangeError("sourceEnd out of bounds");

            // Are we oob?
            if (end > this.length) end = this.length;
            if (target.length - targetStart < end - start) {
              end = target.length - targetStart + start;
            }

            var len = end - start;
            var i;

            if (this === target && start < targetStart && targetStart < end) {
              // descending copy from end
              for (i = len - 1; i >= 0; --i) {
                target[i + targetStart] = this[i + start];
              }
            } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
              // ascending copy from start
              for (i = 0; i < len; ++i) {
                target[i + targetStart] = this[i + start];
              }
            } else {
              Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
            }

            return len;
          };

          // Usage:
          //    buffer.fill(number[, offset[, end]])
          //    buffer.fill(buffer[, offset[, end]])
          //    buffer.fill(string[, offset[, end]][, encoding])
          Buffer.prototype.fill = function fill(val, start, end, encoding) {
            // Handle string cases:
            if (typeof val === "string") {
              if (typeof start === "string") {
                encoding = start;
                start = 0;
                end = this.length;
              } else if (typeof end === "string") {
                encoding = end;
                end = this.length;
              }
              if (val.length === 1) {
                var code = val.charCodeAt(0);
                if (code < 256) {
                  val = code;
                }
              }
              if (encoding !== undefined && typeof encoding !== "string") {
                throw new TypeError("encoding must be a string");
              }
              if (typeof encoding === "string" && !Buffer.isEncoding(encoding)) {
                throw new TypeError("Unknown encoding: " + encoding);
              }
            } else if (typeof val === "number") {
              val = val & 255;
            }

            // Invalid ranges are not set to a default, so can range check early.
            if (start < 0 || this.length < start || this.length < end) {
              throw new RangeError("Out of range index");
            }

            if (end <= start) {
              return this;
            }

            start = start >>> 0;
            end = end === undefined ? this.length : end >>> 0;

            if (!val) val = 0;

            var i;
            if (typeof val === "number") {
              for (i = start; i < end; ++i) {
                this[i] = val;
              }
            } else {
              var bytes = Buffer.isBuffer(val) ? val : utf8ToBytes(new Buffer(val, encoding).toString());
              var len = bytes.length;
              for (i = 0; i < end - start; ++i) {
                this[i + start] = bytes[i % len];
              }
            }

            return this;
          };

          // HELPER FUNCTIONS
          // ================

          var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

          function base64clean(str) {
            // Node strips out invalid characters like \n and \t from the string, base64-js does not
            str = stringtrim(str).replace(INVALID_BASE64_RE, "");
            // Node converts strings with length < 2 to ''
            if (str.length < 2) return "";
            // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
            while (str.length % 4 !== 0) {
              str = str + "=";
            }
            return str;
          }

          function stringtrim(str) {
            if (str.trim) return str.trim();
            return str.replace(/^\s+|\s+$/g, "");
          }

          function toHex(n) {
            if (n < 16) return "0" + n.toString(16);
            return n.toString(16);
          }

          function utf8ToBytes(string, units) {
            units = units || Infinity;
            var codePoint;
            var length = string.length;
            var leadSurrogate = null;
            var bytes = [];

            for (var i = 0; i < length; ++i) {
              codePoint = string.charCodeAt(i);

              // is surrogate component
              if (codePoint > 0xd7ff && codePoint < 0xe000) {
                // last char was a lead
                if (!leadSurrogate) {
                  // no lead yet
                  if (codePoint > 0xdbff) {
                    // unexpected trail
                    if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                    continue;
                  } else if (i + 1 === length) {
                    // unpaired lead
                    if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                    continue;
                  }

                  // valid lead
                  leadSurrogate = codePoint;

                  continue;
                }

                // 2 leads in a row
                if (codePoint < 0xdc00) {
                  if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
                  leadSurrogate = codePoint;
                  continue;
                }

                // valid surrogate pair
                codePoint = (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
              } else if (leadSurrogate) {
                // valid bmp char, but last char was a lead
                if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
              }

              leadSurrogate = null;

              // encode utf8
              if (codePoint < 0x80) {
                if ((units -= 1) < 0) break;
                bytes.push(codePoint);
              } else if (codePoint < 0x800) {
                if ((units -= 2) < 0) break;
                bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
              } else if (codePoint < 0x10000) {
                if ((units -= 3) < 0) break;
                bytes.push((codePoint >> 0xc) | 0xe0, ((codePoint >> 0x6) & 0x3f) | 0x80, (codePoint & 0x3f) | 0x80);
              } else if (codePoint < 0x110000) {
                if ((units -= 4) < 0) break;
                bytes.push(
                  (codePoint >> 0x12) | 0xf0,
                  ((codePoint >> 0xc) & 0x3f) | 0x80,
                  ((codePoint >> 0x6) & 0x3f) | 0x80,
                  (codePoint & 0x3f) | 0x80
                );
              } else {
                throw new Error("Invalid code point");
              }
            }

            return bytes;
          }

          function asciiToBytes(str) {
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              // Node's code seems to be doing this and not & 0x7F..
              byteArray.push(str.charCodeAt(i) & 0xff);
            }
            return byteArray;
          }

          function utf16leToBytes(str, units) {
            var c, hi, lo;
            var byteArray = [];
            for (var i = 0; i < str.length; ++i) {
              if ((units -= 2) < 0) break;

              c = str.charCodeAt(i);
              hi = c >> 8;
              lo = c % 256;
              byteArray.push(lo);
              byteArray.push(hi);
            }

            return byteArray;
          }

          function base64ToBytes(str) {
            return base64.toByteArray(base64clean(str));
          }

          function blitBuffer(src, dst, offset, length) {
            for (var i = 0; i < length; ++i) {
              if (i + offset >= dst.length || i >= src.length) break;
              dst[i + offset] = src[i];
            }
            return i;
          }

          function isnan(val) {
            return val !== val; // eslint-disable-line no-self-compare
          }
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
        ));
      },
      { "base64-js": 1, ieee754: 3, isarray: 4 }
    ],
    3: [
      function(require, module, exports) {
        exports.read = function(buffer, offset, isLE, mLen, nBytes) {
          var e, m;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var nBits = -7;
          var i = isLE ? nBytes - 1 : 0;
          var d = isLE ? -1 : 1;
          var s = buffer[offset + i];

          i += d;

          e = s & ((1 << -nBits) - 1);
          s >>= -nBits;
          nBits += eLen;
          for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

          m = e & ((1 << -nBits) - 1);
          e >>= -nBits;
          nBits += mLen;
          for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

          if (e === 0) {
            e = 1 - eBias;
          } else if (e === eMax) {
            return m ? NaN : (s ? -1 : 1) * Infinity;
          } else {
            m = m + Math.pow(2, mLen);
            e = e - eBias;
          }
          return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
        };

        exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
          var e, m, c;
          var eLen = nBytes * 8 - mLen - 1;
          var eMax = (1 << eLen) - 1;
          var eBias = eMax >> 1;
          var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
          var i = isLE ? 0 : nBytes - 1;
          var d = isLE ? 1 : -1;
          var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

          value = Math.abs(value);

          if (isNaN(value) || value === Infinity) {
            m = isNaN(value) ? 1 : 0;
            e = eMax;
          } else {
            e = Math.floor(Math.log(value) / Math.LN2);
            if (value * (c = Math.pow(2, -e)) < 1) {
              e--;
              c *= 2;
            }
            if (e + eBias >= 1) {
              value += rt / c;
            } else {
              value += rt * Math.pow(2, 1 - eBias);
            }
            if (value * c >= 2) {
              e++;
              c /= 2;
            }

            if (e + eBias >= eMax) {
              m = 0;
              e = eMax;
            } else if (e + eBias >= 1) {
              m = (value * c - 1) * Math.pow(2, mLen);
              e = e + eBias;
            } else {
              m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
              e = 0;
            }
          }

          for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

          e = (e << mLen) | m;
          eLen += mLen;
          for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

          buffer[offset + i - d] |= s * 128;
        };
      },
      {}
    ],
    4: [
      function(require, module, exports) {
        var toString = {}.toString;

        module.exports =
          Array.isArray ||
          function(arr) {
            return toString.call(arr) == "[object Array]";
          };
      },
      {}
    ],
    5: [
      function(require, module, exports) {
        var createLayout = require("layout-bmfont-text");
        var inherits = require("inherits");
        var createIndices = require("quad-indices");
        var buffer = require("three-buffer-vertex-data");
        var assign = require("object-assign");

        var vertices = require("./lib/vertices");
        var utils = require("./lib/utils");

        var Base = THREE.BufferGeometry;

        module.exports = function createTextGeometry(opt) {
          return new TextGeometry(opt);
        };

        function TextGeometry(opt) {
          Base.call(this);

          if (typeof opt === "string") {
            opt = { text: opt };
          }

          // use these as default values for any subsequent
          // calls to update()
          this._opt = assign({}, opt);

          // also do an initial setup...
          if (opt) this.update(opt);
        }

        inherits(TextGeometry, Base);

        TextGeometry.prototype.update = function(opt) {
          if (typeof opt === "string") {
            opt = { text: opt };
          }

          // use constructor defaults
          opt = assign({}, this._opt, opt);

          if (!opt.font) {
            throw new TypeError("must specify a { font } in options");
          }

          this.layout = createLayout(opt);

          // get vec2 texcoords
          var flipY = opt.flipY !== false;

          // the desired BMFont data
          var font = opt.font;

          // determine texture size from font file
          var texWidth = font.common.scaleW;
          var texHeight = font.common.scaleH;

          // get visible glyphs
          var glyphs = this.layout.glyphs.filter(function(glyph) {
            var bitmap = glyph.data;
            return bitmap.width * bitmap.height > 0;
          });

          // provide visible glyphs for convenience
          this.visibleGlyphs = glyphs;

          // get common vertex data
          var positions = vertices.positions(glyphs);
          var uvs = vertices.uvs(glyphs, texWidth, texHeight, flipY);
          var indices = createIndices({
            clockwise: true,
            type: "uint16",
            count: glyphs.length
          });

          // update vertex data
          buffer.index(this, indices, 1, "uint16");
          buffer.attr(this, "position", positions, 2);
          buffer.attr(this, "uv", uvs, 2);

          // update multipage data
          if (!opt.multipage && "page" in this.attributes) {
            // disable multipage rendering
            this.removeAttribute("page");
          } else if (opt.multipage) {
            var pages = vertices.pages(glyphs);
            // enable multipage rendering
            buffer.attr(this, "page", pages, 1);
          }
        };

        TextGeometry.prototype.computeBoundingSphere = function() {
          if (this.boundingSphere === null) {
            this.boundingSphere = new THREE.Sphere();
          }

          var positions = this.attributes.position.array;
          var itemSize = this.attributes.position.itemSize;
          if (!positions || !itemSize || positions.length < 2) {
            this.boundingSphere.radius = 0;
            this.boundingSphere.center.set(0, 0, 0);
            return;
          }
          utils.computeSphere(positions, this.boundingSphere);
          if (isNaN(this.boundingSphere.radius)) {
            console.error(
              "THREE.BufferGeometry.computeBoundingSphere(): " +
                "Computed radius is NaN. The " +
                '"position" attribute is likely to have NaN values.'
            );
          }
        };

        TextGeometry.prototype.computeBoundingBox = function() {
          if (this.boundingBox === null) {
            this.boundingBox = new THREE.Box3();
          }

          var bbox = this.boundingBox;
          var positions = this.attributes.position.array;
          var itemSize = this.attributes.position.itemSize;
          if (!positions || !itemSize || positions.length < 2) {
            bbox.makeEmpty();
            return;
          }
          utils.computeBox(positions, bbox);
        };
      },
      {
        "./lib/utils": 6,
        "./lib/vertices": 7,
        inherits: 16,
        "layout-bmfont-text": 19,
        "object-assign": 22,
        "quad-indices": 28,
        "three-buffer-vertex-data": 29
      }
    ],
    6: [
      function(require, module, exports) {
        var itemSize = 2;
        var box = { min: [0, 0], max: [0, 0] };

        function bounds(positions) {
          var count = positions.length / itemSize;
          box.min[0] = positions[0];
          box.min[1] = positions[1];
          box.max[0] = positions[0];
          box.max[1] = positions[1];

          for (var i = 0; i < count; i++) {
            var x = positions[i * itemSize + 0];
            var y = positions[i * itemSize + 1];
            box.min[0] = Math.min(x, box.min[0]);
            box.min[1] = Math.min(y, box.min[1]);
            box.max[0] = Math.max(x, box.max[0]);
            box.max[1] = Math.max(y, box.max[1]);
          }
        }

        module.exports.computeBox = function(positions, output) {
          bounds(positions);
          output.min.set(box.min[0], box.min[1], 0);
          output.max.set(box.max[0], box.max[1], 0);
        };

        module.exports.computeSphere = function(positions, output) {
          bounds(positions);
          var minX = box.min[0];
          var minY = box.min[1];
          var maxX = box.max[0];
          var maxY = box.max[1];
          var width = maxX - minX;
          var height = maxY - minY;
          var length = Math.sqrt(width * width + height * height);
          output.center.set(minX + width / 2, minY + height / 2, 0);
          output.radius = length / 2;
        };
      },
      {}
    ],
    7: [
      function(require, module, exports) {
        module.exports.pages = function pages(glyphs) {
          var pages = new Float32Array(glyphs.length * 4 * 1);
          var i = 0;
          glyphs.forEach(function(glyph) {
            var id = glyph.data.page || 0;
            pages[i++] = id;
            pages[i++] = id;
            pages[i++] = id;
            pages[i++] = id;
          });
          return pages;
        };

        module.exports.uvs = function uvs(glyphs, texWidth, texHeight, flipY) {
          var uvs = new Float32Array(glyphs.length * 4 * 2);
          var i = 0;
          glyphs.forEach(function(glyph) {
            var bitmap = glyph.data;
            var bw = bitmap.x + bitmap.width;
            var bh = bitmap.y + bitmap.height;

            // top left position
            var u0 = bitmap.x / texWidth;
            var v1 = bitmap.y / texHeight;
            var u1 = bw / texWidth;
            var v0 = bh / texHeight;

            if (flipY) {
              v1 = (texHeight - bitmap.y) / texHeight;
              v0 = (texHeight - bh) / texHeight;
            }

            // BL
            uvs[i++] = u0;
            uvs[i++] = v1;
            // TL
            uvs[i++] = u0;
            uvs[i++] = v0;
            // TR
            uvs[i++] = u1;
            uvs[i++] = v0;
            // BR
            uvs[i++] = u1;
            uvs[i++] = v1;
          });
          return uvs;
        };

        module.exports.positions = function positions(glyphs) {
          var positions = new Float32Array(glyphs.length * 4 * 2);
          var i = 0;
          glyphs.forEach(function(glyph) {
            var bitmap = glyph.data;

            // bottom left position
            var x = glyph.position[0] + bitmap.xoffset;
            var y = glyph.position[1] + bitmap.yoffset;

            // quad size
            var w = bitmap.width;
            var h = bitmap.height;

            // BL
            positions[i++] = x;
            positions[i++] = y;
            // TL
            positions[i++] = x;
            positions[i++] = y + h;
            // TR
            positions[i++] = x + w;
            positions[i++] = y + h;
            // BR
            positions[i++] = x + w;
            positions[i++] = y;
          });
          return positions;
        };
      },
      {}
    ],
    8: [
      function(require, module, exports) {
        var str = Object.prototype.toString;

        module.exports = anArray;

        function anArray(arr) {
          return (arr.BYTES_PER_ELEMENT && str.call(arr.buffer) === "[object ArrayBuffer]") || Array.isArray(arr);
        }
      },
      {}
    ],
    9: [
      function(require, module, exports) {
        module.exports = function numtype(num, def) {
          return typeof num === "number" ? num : typeof def === "number" ? def : 0;
        };
      },
      {}
    ],
    10: [
      function(require, module, exports) {
        var Buffer = require("buffer").Buffer; // for use with browserify

        module.exports = function(a, b) {
          if (!Buffer.isBuffer(a)) return undefined;
          if (!Buffer.isBuffer(b)) return undefined;
          if (typeof a.equals === "function") return a.equals(b);
          if (a.length !== b.length) return false;

          for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false;
          }

          return true;
        };
      },
      { buffer: 2 }
    ],
    11: [
      function(require, module, exports) {
        module.exports = function(dtype) {
          switch (dtype) {
            case "int8":
              return Int8Array;
            case "int16":
              return Int16Array;
            case "int32":
              return Int32Array;
            case "uint8":
              return Uint8Array;
            case "uint16":
              return Uint16Array;
            case "uint32":
              return Uint32Array;
            case "float32":
              return Float32Array;
            case "float64":
              return Float64Array;
            case "array":
              return Array;
            case "uint8_clamped":
              return Uint8ClampedArray;
          }
        };
      },
      {}
    ],
    12: [
      function(require, module, exports) {
        /*eslint new-cap:0*/
        var dtype = require("dtype");
        module.exports = flattenVertexData;
        function flattenVertexData(data, output, offset) {
          if (!data) throw new TypeError("must specify data as first parameter");
          offset = +(offset || 0) | 0;

          if (Array.isArray(data) && Array.isArray(data[0])) {
            var dim = data[0].length;
            var length = data.length * dim;

            // no output specified, create a new typed array
            if (!output || typeof output === "string") {
              output = new (dtype(output || "float32"))(length + offset);
            }

            var dstLength = output.length - offset;
            if (length !== dstLength) {
              throw new Error(
                "source length " +
                  length +
                  " (" +
                  dim +
                  "x" +
                  data.length +
                  ")" +
                  " does not match destination length " +
                  dstLength
              );
            }

            for (var i = 0, k = offset; i < data.length; i++) {
              for (var j = 0; j < dim; j++) {
                output[k++] = data[i][j];
              }
            }
          } else {
            if (!output || typeof output === "string") {
              // no output, create a new one
              var Ctor = dtype(output || "float32");
              if (offset === 0) {
                output = new Ctor(data);
              } else {
                output = new Ctor(data.length + offset);
                output.set(data, offset);
              }
            } else {
              // store output in existing array
              output.set(data, offset);
            }
          }

          return output;
        }
      },
      { dtype: 11 }
    ],
    13: [
      function(require, module, exports) {
        var isFunction = require("is-function");

        module.exports = forEach;

        var toString = Object.prototype.toString;
        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function forEach(list, iterator, context) {
          if (!isFunction(iterator)) {
            throw new TypeError("iterator must be a function");
          }

          if (arguments.length < 3) {
            context = this;
          }

          if (toString.call(list) === "[object Array]") forEachArray(list, iterator, context);
          else if (typeof list === "string") forEachString(list, iterator, context);
          else forEachObject(list, iterator, context);
        }

        function forEachArray(array, iterator, context) {
          for (var i = 0, len = array.length; i < len; i++) {
            if (hasOwnProperty.call(array, i)) {
              iterator.call(context, array[i], i, array);
            }
          }
        }

        function forEachString(string, iterator, context) {
          for (var i = 0, len = string.length; i < len; i++) {
            // no such thing as a sparse string.
            iterator.call(context, string.charAt(i), i, string);
          }
        }

        function forEachObject(object, iterator, context) {
          for (var k in object) {
            if (hasOwnProperty.call(object, k)) {
              iterator.call(context, object[k], k, object);
            }
          }
        }
      },
      { "is-function": 18 }
    ],
    14: [
      function(require, module, exports) {
        (function(global) {
          if (typeof window !== "undefined") {
            module.exports = window;
          } else if (typeof global !== "undefined") {
            module.exports = global;
          } else if (typeof self !== "undefined") {
            module.exports = self;
          } else {
            module.exports = {};
          }
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
        ));
      },
      {}
    ],
    15: [
      function(require, module, exports) {
        module.exports = function compile(property) {
          if (!property || typeof property !== "string") throw new Error("must specify property for indexof search");

          return new Function(
            "array",
            "value",
            "start",
            [
              "start = start || 0",
              "for (var i=start; i<array.length; i++)",
              '  if (array[i]["' + property + '"] === value)',
              "      return i",
              "return -1"
            ].join("\n")
          );
        };
      },
      {}
    ],
    16: [
      function(require, module, exports) {
        if (typeof Object.create === "function") {
          // implementation from standard node.js 'util' module
          module.exports = function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            ctor.prototype = Object.create(superCtor.prototype, {
              constructor: {
                value: ctor,
                enumerable: false,
                writable: true,
                configurable: true
              }
            });
          };
        } else {
          // old school shim for old browsers
          module.exports = function inherits(ctor, superCtor) {
            ctor.super_ = superCtor;
            var TempCtor = function() {};
            TempCtor.prototype = superCtor.prototype;
            ctor.prototype = new TempCtor();
            ctor.prototype.constructor = ctor;
          };
        }
      },
      {}
    ],
    17: [
      function(require, module, exports) {
        /*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

        // The _isBuffer check is for Safari 5-7 support, because it's missing
        // Object.prototype.constructor. Remove this eventually
        module.exports = function(obj) {
          return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer);
        };

        function isBuffer(obj) {
          return !!obj.constructor && typeof obj.constructor.isBuffer === "function" && obj.constructor.isBuffer(obj);
        }

        // For Node v0.10 support. Remove this eventually.
        function isSlowBuffer(obj) {
          return typeof obj.readFloatLE === "function" && typeof obj.slice === "function" && isBuffer(obj.slice(0, 0));
        }
      },
      {}
    ],
    18: [
      function(require, module, exports) {
        module.exports = isFunction;

        var toString = Object.prototype.toString;

        function isFunction(fn) {
          var string = toString.call(fn);
          return (
            string === "[object Function]" ||
            (typeof fn === "function" && string !== "[object RegExp]") ||
            (typeof window !== "undefined" &&
              // IE8 and below
              (fn === window.setTimeout || fn === window.alert || fn === window.confirm || fn === window.prompt))
          );
        }
      },
      {}
    ],
    19: [
      function(require, module, exports) {
        var wordWrap = require("word-wrapper");
        var xtend = require("xtend");
        var findChar = require("indexof-property")("id");
        var number = require("as-number");

        var X_HEIGHTS = ["x", "e", "a", "o", "n", "s", "r", "c", "u", "m", "v", "w", "z"];
        var M_WIDTHS = ["m", "w"];
        var CAP_HEIGHTS = ["H", "I", "N", "E", "F", "K", "L", "T", "U", "V", "W", "X", "Y", "Z"];

        var TAB_ID = "\t".charCodeAt(0);
        var SPACE_ID = " ".charCodeAt(0);
        var ALIGN_LEFT = 0,
          ALIGN_CENTER = 1,
          ALIGN_RIGHT = 2;

        module.exports = function createLayout(opt) {
          return new TextLayout(opt);
        };

        function TextLayout(opt) {
          this.glyphs = [];
          this._measure = this.computeMetrics.bind(this);
          this.update(opt);
        }

        TextLayout.prototype.update = function(opt) {
          opt = xtend(
            {
              measure: this._measure
            },
            opt
          );
          this._opt = opt;
          this._opt.tabSize = number(this._opt.tabSize, 4);

          if (!opt.font) throw new Error("must provide a valid bitmap font");

          var glyphs = this.glyphs;
          var text = opt.text || "";
          var font = opt.font;
          this._setupSpaceGlyphs(font);

          var lines = wordWrap.lines(text, opt);
          var minWidth = opt.width || 0;

          //clear glyphs
          glyphs.length = 0;

          //get max line width
          var maxLineWidth = lines.reduce(function(prev, line) {
            return Math.max(prev, line.width, minWidth);
          }, 0);

          //the pen position
          var x = 0;
          var y = 0;
          var lineHeight = number(opt.lineHeight, font.common.lineHeight);
          var baseline = font.common.base;
          var descender = lineHeight - baseline;
          var letterSpacing = opt.letterSpacing || 0;
          var height = lineHeight * lines.length - descender;
          var align = getAlignType(this._opt.align);

          //draw text along baseline
          y -= height;

          //the metrics for this text layout
          this._width = maxLineWidth;
          this._height = height;
          this._descender = lineHeight - baseline;
          this._baseline = baseline;
          this._xHeight = getXHeight(font);
          this._capHeight = getCapHeight(font);
          this._lineHeight = lineHeight;
          this._ascender = lineHeight - descender - this._xHeight;

          //layout each glyph
          var self = this;
          lines.forEach(function(line, lineIndex) {
            var start = line.start;
            var end = line.end;
            var lineWidth = line.width;
            var lastGlyph;

            //for each glyph in that line...
            for (var i = start; i < end; i++) {
              var id = text.charCodeAt(i);
              var glyph = self.getGlyph(font, id);
              if (glyph) {
                if (lastGlyph) x += getKerning(font, lastGlyph.id, glyph.id);

                var tx = x;
                if (align === ALIGN_CENTER) tx += (maxLineWidth - lineWidth) / 2;
                else if (align === ALIGN_RIGHT) tx += maxLineWidth - lineWidth;

                glyphs.push({
                  position: [tx, y],
                  data: glyph,
                  index: i,
                  line: lineIndex
                });

                //move pen forward
                x += glyph.xadvance + letterSpacing;
                lastGlyph = glyph;
              }
            }

            //next line down
            y += lineHeight;
            x = 0;
          });
          this._linesTotal = lines.length;
        };

        TextLayout.prototype._setupSpaceGlyphs = function(font) {
          //These are fallbacks, when the font doesn't include
          //' ' or '\t' glyphs
          this._fallbackSpaceGlyph = null;
          this._fallbackTabGlyph = null;

          if (!font.chars || font.chars.length === 0) return;

          //try to get space glyph
          //then fall back to the 'm' or 'w' glyphs
          //then fall back to the first glyph available
          var space = getGlyphById(font, SPACE_ID) || getMGlyph(font) || font.chars[0];

          //and create a fallback for tab
          var tabWidth = this._opt.tabSize * space.xadvance;
          this._fallbackSpaceGlyph = space;
          this._fallbackTabGlyph = xtend(space, {
            x: 0,
            y: 0,
            xadvance: tabWidth,
            id: TAB_ID,
            xoffset: 0,
            yoffset: 0,
            width: 0,
            height: 0
          });
        };

        TextLayout.prototype.getGlyph = function(font, id) {
          var glyph = getGlyphById(font, id);
          if (glyph) return glyph;
          else if (id === TAB_ID) return this._fallbackTabGlyph;
          else if (id === SPACE_ID) return this._fallbackSpaceGlyph;
          return null;
        };

        TextLayout.prototype.computeMetrics = function(text, start, end, width) {
          var letterSpacing = this._opt.letterSpacing || 0;
          var font = this._opt.font;
          var curPen = 0;
          var curWidth = 0;
          var count = 0;
          var glyph;
          var lastGlyph;

          if (!font.chars || font.chars.length === 0) {
            return {
              start: start,
              end: start,
              width: 0
            };
          }

          end = Math.min(text.length, end);
          for (var i = start; i < end; i++) {
            var id = text.charCodeAt(i);
            var glyph = this.getGlyph(font, id);

            if (glyph) {
              //move pen forward
              var xoff = glyph.xoffset;
              var kern = lastGlyph ? getKerning(font, lastGlyph.id, glyph.id) : 0;
              curPen += kern;

              var nextPen = curPen + glyph.xadvance + letterSpacing;
              var nextWidth = curPen + glyph.width;

              //we've hit our limit; we can't move onto the next glyph
              if (nextWidth >= width || nextPen >= width) break;

              //otherwise continue along our line
              curPen = nextPen;
              curWidth = nextWidth;
              lastGlyph = glyph;
            }
            count++;
          }

          //make sure rightmost edge lines up with rendered glyphs
          if (lastGlyph) curWidth += lastGlyph.xoffset;

          return {
            start: start,
            end: start + count,
            width: curWidth
          };
        };

        //getters for the private vars
        ["width", "height", "descender", "ascender", "xHeight", "baseline", "capHeight", "lineHeight"].forEach(
          addGetter
        );

        function addGetter(name) {
          Object.defineProperty(TextLayout.prototype, name, {
            get: wrapper(name),
            configurable: true
          });
        }

        //create lookups for private vars
        function wrapper(name) {
          return new Function(["return function " + name + "() {", "  return this._" + name, "}"].join("\n"))();
        }

        function getGlyphById(font, id) {
          if (!font.chars || font.chars.length === 0) return null;

          var glyphIdx = findChar(font.chars, id);
          if (glyphIdx >= 0) return font.chars[glyphIdx];
          return null;
        }

        function getXHeight(font) {
          for (var i = 0; i < X_HEIGHTS.length; i++) {
            var id = X_HEIGHTS[i].charCodeAt(0);
            var idx = findChar(font.chars, id);
            if (idx >= 0) return font.chars[idx].height;
          }
          return 0;
        }

        function getMGlyph(font) {
          for (var i = 0; i < M_WIDTHS.length; i++) {
            var id = M_WIDTHS[i].charCodeAt(0);
            var idx = findChar(font.chars, id);
            if (idx >= 0) return font.chars[idx];
          }
          return 0;
        }

        function getCapHeight(font) {
          for (var i = 0; i < CAP_HEIGHTS.length; i++) {
            var id = CAP_HEIGHTS[i].charCodeAt(0);
            var idx = findChar(font.chars, id);
            if (idx >= 0) return font.chars[idx].height;
          }
          return 0;
        }

        function getKerning(font, left, right) {
          if (!font.kernings || font.kernings.length === 0) return 0;

          var table = font.kernings;
          for (var i = 0; i < table.length; i++) {
            var kern = table[i];
            if (kern.first === left && kern.second === right) return kern.amount;
          }
          return 0;
        }

        function getAlignType(align) {
          if (align === "center") return ALIGN_CENTER;
          else if (align === "right") return ALIGN_RIGHT;
          return ALIGN_LEFT;
        }
      },
      { "as-number": 9, "indexof-property": 15, "word-wrapper": 31, xtend: 34 }
    ],
    20: [
      function(require, module, exports) {
        (function(Buffer) {
          var xhr = require("xhr");
          var noop = function() {};
          var parseASCII = require("parse-bmfont-ascii");
          var parseXML = require("parse-bmfont-xml");
          var readBinary = require("parse-bmfont-binary");
          var isBinaryFormat = require("./lib/is-binary");
          var xtend = require("xtend");

          var xml2 = (function hasXML2() {
            return window.XMLHttpRequest && "withCredentials" in new XMLHttpRequest();
          })();

          module.exports = function(opt, cb) {
            cb = typeof cb === "function" ? cb : noop;

            if (typeof opt === "string") opt = { uri: opt };
            else if (!opt) opt = {};

            var expectBinary = opt.binary;
            if (expectBinary) opt = getBinaryOpts(opt);

            xhr(opt, function(err, res, body) {
              if (err) return cb(err);
              if (!/^2/.test(res.statusCode)) return cb(new Error("http status code: " + res.statusCode));
              if (!body) return cb(new Error("no body result"));

              var binary = false;

              //if the response type is an array buffer,
              //we need to convert it into a regular Buffer object
              if (isArrayBuffer(body)) {
                var array = new Uint8Array(body);
                body = new Buffer(array, "binary");
              }

              //now check the string/Buffer response
              //and see if it has a binary BMF header
              if (isBinaryFormat(body)) {
                binary = true;
                //if we have a string, turn it into a Buffer
                if (typeof body === "string") body = new Buffer(body, "binary");
              }

              //we are not parsing a binary format, just ASCII/XML/etc
              if (!binary) {
                //might still be a buffer if responseType is 'arraybuffer'
                if (Buffer.isBuffer(body)) body = body.toString(opt.encoding);
                body = body.trim();
              }

              var result;
              try {
                var type = res.headers["content-type"];
                if (binary) result = readBinary(body);
                else if (/json/.test(type) || body.charAt(0) === "{") result = JSON.parse(body);
                else if (/xml/.test(type) || body.charAt(0) === "<") result = parseXML(body);
                else result = parseASCII(body);
              } catch (e) {
                cb(new Error("error parsing font " + e.message));
                cb = noop;
              }
              cb(null, result);
            });
          };

          function isArrayBuffer(arr) {
            var str = Object.prototype.toString;
            return str.call(arr) === "[object ArrayBuffer]";
          }

          function getBinaryOpts(opt) {
            //IE10+ and other modern browsers support array buffers
            if (xml2) return xtend(opt, { responseType: "arraybuffer" });

            if (typeof window.XMLHttpRequest === "undefined")
              throw new Error("your browser does not support XHR loading");

            //IE9 and XML1 browsers could still use an override
            var req = new window.XMLHttpRequest();
            req.overrideMimeType("text/plain; charset=x-user-defined");
            return xtend(
              {
                xhr: req
              },
              opt
            );
          }
        }.call(this, require("buffer").Buffer));
      },
      {
        "./lib/is-binary": 21,
        buffer: 2,
        "parse-bmfont-ascii": 23,
        "parse-bmfont-binary": 24,
        "parse-bmfont-xml": 25,
        xhr: 32,
        xtend: 34
      }
    ],
    21: [
      function(require, module, exports) {
        (function(Buffer) {
          var equal = require("buffer-equal");
          var HEADER = new Buffer([66, 77, 70, 3]);

          module.exports = function(buf) {
            if (typeof buf === "string") return buf.substring(0, 3) === "BMF";
            return buf.length > 4 && equal(buf.slice(0, 4), HEADER);
          };
        }.call(this, require("buffer").Buffer));
      },
      { buffer: 2, "buffer-equal": 10 }
    ],
    22: [
      function(require, module, exports) {
        "use strict";
        /* eslint-disable no-unused-vars */
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var propIsEnumerable = Object.prototype.propertyIsEnumerable;

        function toObject(val) {
          if (val === null || val === undefined) {
            throw new TypeError("Object.assign cannot be called with null or undefined");
          }

          return Object(val);
        }

        function shouldUseNative() {
          try {
            if (!Object.assign) {
              return false;
            }

            // Detect buggy property enumeration order in older V8 versions.

            // https://bugs.chromium.org/p/v8/issues/detail?id=4118
            var test1 = new String("abc"); // eslint-disable-line
            test1[5] = "de";
            if (Object.getOwnPropertyNames(test1)[0] === "5") {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test2 = {};
            for (var i = 0; i < 10; i++) {
              test2["_" + String.fromCharCode(i)] = i;
            }
            var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
              return test2[n];
            });
            if (order2.join("") !== "0123456789") {
              return false;
            }

            // https://bugs.chromium.org/p/v8/issues/detail?id=3056
            var test3 = {};
            "abcdefghijklmnopqrst".split("").forEach(function(letter) {
              test3[letter] = letter;
            });
            if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
              return false;
            }

            return true;
          } catch (e) {
            // We don't expect any of the above to throw, but better to be safe.
            return false;
          }
        }

        module.exports = shouldUseNative()
          ? Object.assign
          : function(target, source) {
              var from;
              var to = toObject(target);
              var symbols;

              for (var s = 1; s < arguments.length; s++) {
                from = Object(arguments[s]);

                for (var key in from) {
                  if (hasOwnProperty.call(from, key)) {
                    to[key] = from[key];
                  }
                }

                if (Object.getOwnPropertySymbols) {
                  symbols = Object.getOwnPropertySymbols(from);
                  for (var i = 0; i < symbols.length; i++) {
                    if (propIsEnumerable.call(from, symbols[i])) {
                      to[symbols[i]] = from[symbols[i]];
                    }
                  }
                }
              }

              return to;
            };
      },
      {}
    ],
    23: [
      function(require, module, exports) {
        module.exports = function parseBMFontAscii(data) {
          if (!data) throw new Error("no data provided");
          data = data.toString().trim();

          var output = {
            pages: [],
            chars: [],
            kernings: []
          };

          var lines = data.split(/\r\n?|\n/g);

          if (lines.length === 0) throw new Error("no data in BMFont file");

          for (var i = 0; i < lines.length; i++) {
            var lineData = splitLine(lines[i], i);
            if (
              !lineData //skip empty lines
            )
              continue;

            if (lineData.key === "page") {
              if (typeof lineData.data.id !== "number")
                throw new Error("malformed file at line " + i + " -- needs page id=N");
              if (typeof lineData.data.file !== "string")
                throw new Error("malformed file at line " + i + ' -- needs page file="path"');
              output.pages[lineData.data.id] = lineData.data.file;
            } else if (lineData.key === "chars" || lineData.key === "kernings") {
              //... do nothing for these two ...
            } else if (lineData.key === "char") {
              output.chars.push(lineData.data);
            } else if (lineData.key === "kerning") {
              output.kernings.push(lineData.data);
            } else {
              output[lineData.key] = lineData.data;
            }
          }

          return output;
        };

        function splitLine(line, idx) {
          line = line.replace(/\t+/g, " ").trim();
          if (!line) return null;

          var space = line.indexOf(" ");
          if (space === -1) throw new Error("no named row at line " + idx);

          var key = line.substring(0, space);

          line = line.substring(space + 1);
          //clear "letter" field as it is non-standard and
          //requires additional complexity to parse " / = symbols
          line = line.replace(/letter=[\'\"]\S+[\'\"]/gi, "");
          line = line.split("=");
          line = line.map(function(str) {
            return str.trim().match(/(".*?"|[^"\s]+)+(?=\s*|\s*$)/g);
          });

          var data = [];
          for (var i = 0; i < line.length; i++) {
            var dt = line[i];
            if (i === 0) {
              data.push({
                key: dt[0],
                data: ""
              });
            } else if (i === line.length - 1) {
              data[data.length - 1].data = parseData(dt[0]);
            } else {
              data[data.length - 1].data = parseData(dt[0]);
              data.push({
                key: dt[1],
                data: ""
              });
            }
          }

          var out = {
            key: key,
            data: {}
          };

          data.forEach(function(v) {
            out.data[v.key] = v.data;
          });

          return out;
        }

        function parseData(data) {
          if (!data || data.length === 0) return "";

          if (data.indexOf('"') === 0 || data.indexOf("'") === 0) return data.substring(1, data.length - 1);
          if (data.indexOf(",") !== -1) return parseIntList(data);
          return parseInt(data, 10);
        }

        function parseIntList(data) {
          return data.split(",").map(function(val) {
            return parseInt(val, 10);
          });
        }
      },
      {}
    ],
    24: [
      function(require, module, exports) {
        var HEADER = [66, 77, 70];

        module.exports = function readBMFontBinary(buf) {
          if (buf.length < 6) throw new Error("invalid buffer length for BMFont");

          var header = HEADER.every(function(byte, i) {
            return buf.readUInt8(i) === byte;
          });

          if (!header) throw new Error("BMFont missing BMF byte header");

          var i = 3;
          var vers = buf.readUInt8(i++);
          if (vers > 3) throw new Error("Only supports BMFont Binary v3 (BMFont App v1.10)");

          var target = { kernings: [], chars: [] };
          for (var b = 0; b < 5; b++) i += readBlock(target, buf, i);
          return target;
        };

        function readBlock(target, buf, i) {
          if (i > buf.length - 1) return 0;

          var blockID = buf.readUInt8(i++);
          var blockSize = buf.readInt32LE(i);
          i += 4;

          switch (blockID) {
            case 1:
              target.info = readInfo(buf, i);
              break;
            case 2:
              target.common = readCommon(buf, i);
              break;
            case 3:
              target.pages = readPages(buf, i, blockSize);
              break;
            case 4:
              target.chars = readChars(buf, i, blockSize);
              break;
            case 5:
              target.kernings = readKernings(buf, i, blockSize);
              break;
          }
          return 5 + blockSize;
        }

        function readInfo(buf, i) {
          var info = {};
          info.size = buf.readInt16LE(i);

          var bitField = buf.readUInt8(i + 2);
          info.smooth = (bitField >> 7) & 1;
          info.unicode = (bitField >> 6) & 1;
          info.italic = (bitField >> 5) & 1;
          info.bold = (bitField >> 4) & 1;

          //fixedHeight is only mentioned in binary spec
          if ((bitField >> 3) & 1) info.fixedHeight = 1;

          info.charset = buf.readUInt8(i + 3) || "";
          info.stretchH = buf.readUInt16LE(i + 4);
          info.aa = buf.readUInt8(i + 6);
          info.padding = [buf.readInt8(i + 7), buf.readInt8(i + 8), buf.readInt8(i + 9), buf.readInt8(i + 10)];
          info.spacing = [buf.readInt8(i + 11), buf.readInt8(i + 12)];
          info.outline = buf.readUInt8(i + 13);
          info.face = readStringNT(buf, i + 14);
          return info;
        }

        function readCommon(buf, i) {
          var common = {};
          common.lineHeight = buf.readUInt16LE(i);
          common.base = buf.readUInt16LE(i + 2);
          common.scaleW = buf.readUInt16LE(i + 4);
          common.scaleH = buf.readUInt16LE(i + 6);
          common.pages = buf.readUInt16LE(i + 8);
          var bitField = buf.readUInt8(i + 10);
          common.packed = 0;
          common.alphaChnl = buf.readUInt8(i + 11);
          common.redChnl = buf.readUInt8(i + 12);
          common.greenChnl = buf.readUInt8(i + 13);
          common.blueChnl = buf.readUInt8(i + 14);
          return common;
        }

        function readPages(buf, i, size) {
          var pages = [];
          var text = readNameNT(buf, i);
          var len = text.length + 1;
          var count = size / len;
          for (var c = 0; c < count; c++) {
            pages[c] = buf.slice(i, i + text.length).toString("utf8");
            i += len;
          }
          return pages;
        }

        function readChars(buf, i, blockSize) {
          var chars = [];

          var count = blockSize / 20;
          for (var c = 0; c < count; c++) {
            var char = {};
            var off = c * 20;
            char.id = buf.readUInt32LE(i + 0 + off);
            char.x = buf.readUInt16LE(i + 4 + off);
            char.y = buf.readUInt16LE(i + 6 + off);
            char.width = buf.readUInt16LE(i + 8 + off);
            char.height = buf.readUInt16LE(i + 10 + off);
            char.xoffset = buf.readInt16LE(i + 12 + off);
            char.yoffset = buf.readInt16LE(i + 14 + off);
            char.xadvance = buf.readInt16LE(i + 16 + off);
            char.page = buf.readUInt8(i + 18 + off);
            char.chnl = buf.readUInt8(i + 19 + off);
            chars[c] = char;
          }
          return chars;
        }

        function readKernings(buf, i, blockSize) {
          var kernings = [];
          var count = blockSize / 10;
          for (var c = 0; c < count; c++) {
            var kern = {};
            var off = c * 10;
            kern.first = buf.readUInt32LE(i + 0 + off);
            kern.second = buf.readUInt32LE(i + 4 + off);
            kern.amount = buf.readInt16LE(i + 8 + off);
            kernings[c] = kern;
          }
          return kernings;
        }

        function readNameNT(buf, offset) {
          var pos = offset;
          for (; pos < buf.length; pos++) {
            if (buf[pos] === 0x00) break;
          }
          return buf.slice(offset, pos);
        }

        function readStringNT(buf, offset) {
          return readNameNT(buf, offset).toString("utf8");
        }
      },
      {}
    ],
    25: [
      function(require, module, exports) {
        var parseAttributes = require("./parse-attribs");
        var parseFromString = require("xml-parse-from-string");

        //In some cases element.attribute.nodeName can return
        //all lowercase values.. so we need to map them to the correct
        //case
        var NAME_MAP = {
          scaleh: "scaleH",
          scalew: "scaleW",
          stretchh: "stretchH",
          lineheight: "lineHeight",
          alphachnl: "alphaChnl",
          redchnl: "redChnl",
          greenchnl: "greenChnl",
          bluechnl: "blueChnl"
        };

        module.exports = function parse(data) {
          data = data.toString();

          var xmlRoot = parseFromString(data);
          var output = {
            pages: [],
            chars: [],
            kernings: []
          };

          //get config settings
          ["info", "common"].forEach(function(key) {
            var element = xmlRoot.getElementsByTagName(key)[0];
            if (element) output[key] = parseAttributes(getAttribs(element));
          });

          //get page info
          var pageRoot = xmlRoot.getElementsByTagName("pages")[0];
          if (!pageRoot) throw new Error("malformed file -- no <pages> element");
          var pages = pageRoot.getElementsByTagName("page");
          for (var i = 0; i < pages.length; i++) {
            var p = pages[i];
            var id = parseInt(p.getAttribute("id"), 10);
            var file = p.getAttribute("file");
            if (isNaN(id)) throw new Error('malformed file -- page "id" attribute is NaN');
            if (!file) throw new Error('malformed file -- needs page "file" attribute');
            output.pages[parseInt(id, 10)] = file;
          }

          //get kernings / chars
          ["chars", "kernings"].forEach(function(key) {
            var element = xmlRoot.getElementsByTagName(key)[0];
            if (!element) return;
            var childTag = key.substring(0, key.length - 1);
            var children = element.getElementsByTagName(childTag);
            for (var i = 0; i < children.length; i++) {
              var child = children[i];
              output[key].push(parseAttributes(getAttribs(child)));
            }
          });
          return output;
        };

        function getAttribs(element) {
          var attribs = getAttribList(element);
          return attribs.reduce(function(dict, attrib) {
            var key = mapName(attrib.nodeName);
            dict[key] = attrib.nodeValue;
            return dict;
          }, {});
        }

        function getAttribList(element) {
          //IE8+ and modern browsers
          var attribs = [];
          for (var i = 0; i < element.attributes.length; i++) attribs.push(element.attributes[i]);
          return attribs;
        }

        function mapName(nodeName) {
          return NAME_MAP[nodeName.toLowerCase()] || nodeName;
        }
      },
      { "./parse-attribs": 26, "xml-parse-from-string": 33 }
    ],
    26: [
      function(require, module, exports) {
        //Some versions of GlyphDesigner have a typo
        //that causes some bugs with parsing.
        //Need to confirm with recent version of the software
        //to see whether this is still an issue or not.
        var GLYPH_DESIGNER_ERROR = "chasrset";

        module.exports = function parseAttributes(obj) {
          if (GLYPH_DESIGNER_ERROR in obj) {
            obj["charset"] = obj[GLYPH_DESIGNER_ERROR];
            delete obj[GLYPH_DESIGNER_ERROR];
          }

          for (var k in obj) {
            if (k === "face" || k === "charset") continue;
            else if (k === "padding" || k === "spacing") obj[k] = parseIntList(obj[k]);
            else obj[k] = parseInt(obj[k], 10);
          }
          return obj;
        };

        function parseIntList(data) {
          return data.split(",").map(function(val) {
            return parseInt(val, 10);
          });
        }
      },
      {}
    ],
    27: [
      function(require, module, exports) {
        var trim = require("trim"),
          forEach = require("for-each"),
          isArray = function(arg) {
            return Object.prototype.toString.call(arg) === "[object Array]";
          };

        module.exports = function(headers) {
          if (!headers) return {};

          var result = {};

          forEach(trim(headers).split("\n"), function(row) {
            var index = row.indexOf(":"),
              key = trim(row.slice(0, index)).toLowerCase(),
              value = trim(row.slice(index + 1));

            if (typeof result[key] === "undefined") {
              result[key] = value;
            } else if (isArray(result[key])) {
              result[key].push(value);
            } else {
              result[key] = [result[key], value];
            }
          });

          return result;
        };
      },
      { "for-each": 13, trim: 30 }
    ],
    28: [
      function(require, module, exports) {
        var dtype = require("dtype");
        var anArray = require("an-array");
        var isBuffer = require("is-buffer");

        var CW = [0, 2, 3];
        var CCW = [2, 1, 3];

        module.exports = function createQuadElements(array, opt) {
          //if user didn't specify an output array
          if (!array || !(anArray(array) || isBuffer(array))) {
            opt = array || {};
            array = null;
          }

          if (
            typeof opt === "number" //backwards-compatible
          )
            opt = { count: opt };
          else opt = opt || {};

          var type = typeof opt.type === "string" ? opt.type : "uint16";
          var count = typeof opt.count === "number" ? opt.count : 1;
          var start = opt.start || 0;

          var dir = opt.clockwise !== false ? CW : CCW,
            a = dir[0],
            b = dir[1],
            c = dir[2];

          var numIndices = count * 6;

          var indices = array || new (dtype(type))(numIndices);
          for (var i = 0, j = 0; i < numIndices; i += 6, j += 4) {
            var x = i + start;
            indices[x + 0] = j + 0;
            indices[x + 1] = j + 1;
            indices[x + 2] = j + 2;
            indices[x + 3] = j + a;
            indices[x + 4] = j + b;
            indices[x + 5] = j + c;
          }
          return indices;
        };
      },
      { "an-array": 8, dtype: 11, "is-buffer": 17 }
    ],
    29: [
      function(require, module, exports) {
        var flatten = require("flatten-vertex-data");
        var warned = false;

        module.exports.attr = setAttribute;
        module.exports.index = setIndex;

        function setIndex(geometry, data, itemSize, dtype) {
          if (typeof itemSize !== "number") itemSize = 1;
          if (typeof dtype !== "string") dtype = "uint16";

          var isR69 = !geometry.index && typeof geometry.setIndex !== "function";
          var attrib = isR69 ? geometry.getAttribute("index") : geometry.index;
          var newAttrib = updateAttribute(attrib, data, itemSize, dtype);
          if (newAttrib) {
            if (isR69) geometry.addAttribute("index", newAttrib);
            else geometry.index = newAttrib;
          }
        }

        function setAttribute(geometry, key, data, itemSize, dtype) {
          if (typeof itemSize !== "number") itemSize = 3;
          if (typeof dtype !== "string") dtype = "float32";
          if (Array.isArray(data) && Array.isArray(data[0]) && data[0].length !== itemSize) {
            throw new Error(
              "Nested vertex array has unexpected size; expected " + itemSize + " but found " + data[0].length
            );
          }

          var attrib = geometry.getAttribute(key);
          var newAttrib = updateAttribute(attrib, data, itemSize, dtype);
          if (newAttrib) {
            geometry.addAttribute(key, newAttrib);
          }
        }

        function updateAttribute(attrib, data, itemSize, dtype) {
          data = data || [];
          if (!attrib || rebuildAttribute(attrib, data, itemSize)) {
            // create a new array with desired type
            data = flatten(data, dtype);
            if (attrib && !warned) {
              warned = true;
              console.warn(
                [
                  "A WebGL buffer is being updated with a new size or itemSize, ",
                  "however ThreeJS only supports fixed-size buffers.\nThe old buffer may ",
                  "still be kept in memory.\n",
                  "To avoid memory leaks, it is recommended that you dispose ",
                  "your geometries and create new ones, or support the following PR in ThreeJS:\n",
                  "https://github.com/mrdoob/three.js/pull/9631"
                ].join("")
              );
            }
            attrib = new THREE.BufferAttribute(data, itemSize);
            attrib.needsUpdate = true;
            return attrib;
          } else {
            // copy data into the existing array
            flatten(data, attrib.array);
            attrib.needsUpdate = true;
            return null;
          }
        }

        // Test whether the attribute needs to be re-created,
        // returns false if we can re-use it as-is.
        function rebuildAttribute(attrib, data, itemSize) {
          if (attrib.itemSize !== itemSize) return true;
          if (!attrib.array) return true;
          var attribLength = attrib.array.length;
          if (Array.isArray(data) && Array.isArray(data[0])) {
            // [ [ x, y, z ] ]
            return attribLength !== data.length * itemSize;
          } else {
            // [ x, y, z ]
            return attribLength !== data.length;
          }
          return false;
        }
      },
      { "flatten-vertex-data": 12 }
    ],
    30: [
      function(require, module, exports) {
        exports = module.exports = trim;

        function trim(str) {
          return str.replace(/^\s*|\s*$/g, "");
        }

        exports.left = function(str) {
          return str.replace(/^\s*/, "");
        };

        exports.right = function(str) {
          return str.replace(/\s*$/, "");
        };
      },
      {}
    ],
    31: [
      function(require, module, exports) {
        var newline = /\n/;
        var newlineChar = "\n";
        var whitespace = /\s/;

        module.exports = function(text, opt) {
          var lines = module.exports.lines(text, opt);
          return lines
            .map(function(line) {
              return text.substring(line.start, line.end);
            })
            .join("\n");
        };

        module.exports.lines = function wordwrap(text, opt) {
          opt = opt || {};

          //zero width results in nothing visible
          if (opt.width === 0 && opt.mode !== "nowrap") return [];

          text = text || "";
          var width = typeof opt.width === "number" ? opt.width : Number.MAX_VALUE;
          var start = Math.max(0, opt.start || 0);
          var end = typeof opt.end === "number" ? opt.end : text.length;
          var mode = opt.mode;

          var measure = opt.measure || monospace;
          if (mode === "pre") return pre(measure, text, start, end, width);
          else return greedy(measure, text, start, end, width, mode);
        };

        function idxOf(text, chr, start, end) {
          var idx = text.indexOf(chr, start);
          if (idx === -1 || idx > end) return end;
          return idx;
        }

        function isWhitespace(chr) {
          return whitespace.test(chr);
        }

        function pre(measure, text, start, end, width) {
          var lines = [];
          var lineStart = start;
          for (var i = start; i < end && i < text.length; i++) {
            var chr = text.charAt(i);
            var isNewline = newline.test(chr);

            //If we've reached a newline, then step down a line
            //Or if we've reached the EOF
            if (isNewline || i === end - 1) {
              var lineEnd = isNewline ? i : i + 1;
              var measured = measure(text, lineStart, lineEnd, width);
              lines.push(measured);

              lineStart = i + 1;
            }
          }
          return lines;
        }

        function greedy(measure, text, start, end, width, mode) {
          //A greedy word wrapper based on LibGDX algorithm
          //https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/BitmapFontCache.java
          var lines = [];

          var testWidth = width;
          //if 'nowrap' is specified, we only wrap on newline chars
          if (mode === "nowrap") testWidth = Number.MAX_VALUE;

          while (start < end && start < text.length) {
            //get next newline position
            var newLine = idxOf(text, newlineChar, start, end);

            //eat whitespace at start of line
            while (start < newLine) {
              if (!isWhitespace(text.charAt(start))) break;
              start++;
            }

            //determine visible # of glyphs for the available width
            var measured = measure(text, start, newLine, testWidth);

            var lineEnd = start + (measured.end - measured.start);
            var nextStart = lineEnd + newlineChar.length;

            //if we had to cut the line before the next newline...
            if (lineEnd < newLine) {
              //find char to break on
              while (lineEnd > start) {
                if (isWhitespace(text.charAt(lineEnd))) break;
                lineEnd--;
              }
              if (lineEnd === start) {
                if (nextStart > start + newlineChar.length) nextStart--;
                lineEnd = nextStart; // If no characters to break, show all.
              } else {
                nextStart = lineEnd;
                //eat whitespace at end of line
                while (lineEnd > start) {
                  if (!isWhitespace(text.charAt(lineEnd - newlineChar.length))) break;
                  lineEnd--;
                }
              }
            }
            if (lineEnd >= start) {
              var result = measure(text, start, lineEnd, testWidth);
              lines.push(result);
            }
            start = nextStart;
          }
          return lines;
        }

        //determines the visible number of glyphs within a given width
        function monospace(text, start, end, width) {
          var glyphs = Math.min(width, end - start);
          return {
            start: start,
            end: start + glyphs
          };
        }
      },
      {}
    ],
    32: [
      function(require, module, exports) {
        "use strict";
        var window = require("global/window");
        var isFunction = require("is-function");
        var parseHeaders = require("parse-headers");
        var xtend = require("xtend");

        module.exports = createXHR;
        createXHR.XMLHttpRequest = window.XMLHttpRequest || noop;
        createXHR.XDomainRequest =
          "withCredentials" in new createXHR.XMLHttpRequest() ? createXHR.XMLHttpRequest : window.XDomainRequest;

        forEachArray(["get", "put", "post", "patch", "head", "delete"], function(method) {
          createXHR[method === "delete" ? "del" : method] = function(uri, options, callback) {
            options = initParams(uri, options, callback);
            options.method = method.toUpperCase();
            return _createXHR(options);
          };
        });

        function forEachArray(array, iterator) {
          for (var i = 0; i < array.length; i++) {
            iterator(array[i]);
          }
        }

        function isEmpty(obj) {
          for (var i in obj) {
            if (obj.hasOwnProperty(i)) return false;
          }
          return true;
        }

        function initParams(uri, options, callback) {
          var params = uri;

          if (isFunction(options)) {
            callback = options;
            if (typeof uri === "string") {
              params = { uri: uri };
            }
          } else {
            params = xtend(options, { uri: uri });
          }

          params.callback = callback;
          return params;
        }

        function createXHR(uri, options, callback) {
          options = initParams(uri, options, callback);
          return _createXHR(options);
        }

        function _createXHR(options) {
          if (typeof options.callback === "undefined") {
            throw new Error("callback argument missing");
          }

          var called = false;
          var callback = function cbOnce(err, response, body) {
            if (!called) {
              called = true;
              options.callback(err, response, body);
            }
          };

          function readystatechange() {
            if (xhr.readyState === 4) {
              loadFunc();
            }
          }

          function getBody() {
            // Chrome with requestType=blob throws errors arround when even testing access to responseText
            var body = undefined;

            if (xhr.response) {
              body = xhr.response;
            } else {
              body = xhr.responseText || getXml(xhr);
            }

            if (isJson) {
              try {
                body = JSON.parse(body);
              } catch (e) {}
            }

            return body;
          }

          var failureResponse = {
            body: undefined,
            headers: {},
            statusCode: 0,
            method: method,
            url: uri,
            rawRequest: xhr
          };

          function errorFunc(evt) {
            clearTimeout(timeoutTimer);
            if (!(evt instanceof Error)) {
              evt = new Error("" + (evt || "Unknown XMLHttpRequest Error"));
            }
            evt.statusCode = 0;
            return callback(evt, failureResponse);
          }

          // will load the data & process the response in a special response object
          function loadFunc() {
            if (aborted) return;
            var status;
            clearTimeout(timeoutTimer);
            if (options.useXDR && xhr.status === undefined) {
              //IE8 CORS GET successful response doesn't have a status field, but body is fine
              status = 200;
            } else {
              status = xhr.status === 1223 ? 204 : xhr.status;
            }
            var response = failureResponse;
            var err = null;

            if (status !== 0) {
              response = {
                body: getBody(),
                statusCode: status,
                method: method,
                headers: {},
                url: uri,
                rawRequest: xhr
              };
              if (xhr.getAllResponseHeaders) {
                //remember xhr can in fact be XDR for CORS in IE
                response.headers = parseHeaders(xhr.getAllResponseHeaders());
              }
            } else {
              err = new Error("Internal XMLHttpRequest Error");
            }
            return callback(err, response, response.body);
          }

          var xhr = options.xhr || null;

          if (!xhr) {
            if (options.cors || options.useXDR) {
              xhr = new createXHR.XDomainRequest();
            } else {
              xhr = new createXHR.XMLHttpRequest();
            }
          }

          var key;
          var aborted;
          var uri = (xhr.url = options.uri || options.url);
          var method = (xhr.method = options.method || "GET");
          var body = options.body || options.data || null;
          var headers = (xhr.headers = options.headers || {});
          var sync = !!options.sync;
          var isJson = false;
          var timeoutTimer;

          if ("json" in options) {
            isJson = true;
            headers["accept"] || headers["Accept"] || (headers["Accept"] = "application/json"); //Don't override existing accept header declared by user
            if (method !== "GET" && method !== "HEAD") {
              headers["content-type"] || headers["Content-Type"] || (headers["Content-Type"] = "application/json"); //Don't override existing accept header declared by user
              body = JSON.stringify(options.json);
            }
          }

          xhr.onreadystatechange = readystatechange;
          xhr.onload = loadFunc;
          xhr.onerror = errorFunc;
          // IE9 must have onprogress be set to a unique function.
          xhr.onprogress = function() {
            // IE must die
          };
          xhr.ontimeout = errorFunc;
          xhr.open(method, uri, !sync, options.username, options.password);
          //has to be after open
          if (!sync) {
            xhr.withCredentials = !!options.withCredentials;
          }
          // Cannot set timeout with sync request
          // not setting timeout on the xhr object, because of old webkits etc. not handling that correctly
          // both npm's request and jquery 1.x use this kind of timeout, so this is being consistent
          if (!sync && options.timeout > 0) {
            timeoutTimer = setTimeout(function() {
              aborted = true; //IE9 may still call readystatechange
              xhr.abort("timeout");
              var e = new Error("XMLHttpRequest timeout");
              e.code = "ETIMEDOUT";
              errorFunc(e);
            }, options.timeout);
          }

          if (xhr.setRequestHeader) {
            for (key in headers) {
              if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
              }
            }
          } else if (options.headers && !isEmpty(options.headers)) {
            throw new Error("Headers cannot be set on an XDomainRequest object");
          }

          if ("responseType" in options) {
            xhr.responseType = options.responseType;
          }

          if ("beforeSend" in options && typeof options.beforeSend === "function") {
            options.beforeSend(xhr);
          }

          xhr.send(body);

          return xhr;
        }

        function getXml(xhr) {
          if (xhr.responseType === "document") {
            return xhr.responseXML;
          }
          var firefoxBugTakenEffect =
            xhr.status === 204 && xhr.responseXML && xhr.responseXML.documentElement.nodeName === "parsererror";
          if (xhr.responseType === "" && !firefoxBugTakenEffect) {
            return xhr.responseXML;
          }

          return null;
        }

        function noop() {}
      },
      { "global/window": 14, "is-function": 18, "parse-headers": 27, xtend: 34 }
    ],
    33: [
      function(require, module, exports) {
        module.exports = (function xmlparser() {
          //common browsers
          if (typeof window.DOMParser !== "undefined") {
            return function(str) {
              var parser = new window.DOMParser();
              return parser.parseFromString(str, "application/xml");
            };
          }

          //IE8 fallback
          if (typeof window.ActiveXObject !== "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
            return function(str) {
              var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
              xmlDoc.async = "false";
              xmlDoc.loadXML(str);
              return xmlDoc;
            };
          }

          //last resort fallback
          return function(str) {
            var div = document.createElement("div");
            div.innerHTML = str;
            return div;
          };
        })();
      },
      {}
    ],
    34: [
      function(require, module, exports) {
        module.exports = extend;

        var hasOwnProperty = Object.prototype.hasOwnProperty;

        function extend() {
          var target = {};

          for (var i = 0; i < arguments.length; i++) {
            var source = arguments[i];

            for (var key in source) {
              if (hasOwnProperty.call(source, key)) {
                target[key] = source[key];
              }
            }
          }

          return target;
        }
      },
      {}
    ],
    35: [
      function(require, module, exports) {
        var assign = require("object-assign");

        module.exports = function createSDFShader(opt) {
          opt = opt || {};
          var opacity = typeof opt.opacity === "number" ? opt.opacity : 1;
          var alphaTest = typeof opt.alphaTest === "number" ? opt.alphaTest : 0.0001;
          var precision = opt.precision || "highp";
          var color = opt.color;
          var map = opt.map;

          // remove to satisfy r73
          delete opt.map;
          delete opt.color;
          delete opt.precision;
          delete opt.opacity;

          return assign(
            {
              uniforms: {
                opacity: { type: "f", value: opacity },
                map: { type: "t", value: map || new THREE.Texture() },
                color: { type: "c", value: new THREE.Color(color) }
              },
              vertexShader: [
                "attribute vec2 uv;",
                "attribute vec4 position;",
                "uniform mat4 projectionMatrix;",
                "uniform mat4 modelViewMatrix;",
                "varying vec2 vUv;",
                "void main() {",
                "vUv = uv;",
                "gl_Position = projectionMatrix * modelViewMatrix * position;",
                "}"
              ].join("\n"),
              fragmentShader: [
                "#ifdef GL_OES_standard_derivatives",
                "#extension GL_OES_standard_derivatives : enable",
                "#endif",
                "precision " + precision + " float;",
                "uniform float opacity;",
                "uniform vec3 color;",
                "uniform sampler2D map;",
                "varying vec2 vUv;",

                "float aastep(float value) {",
                "  #ifdef GL_OES_standard_derivatives",
                "    float afwidth = length(vec2(dFdx(value), dFdy(value))) * 0.70710678118654757;",
                "  #else",
                "    float afwidth = (1.0 / 32.0) * (1.4142135623730951 / (2.0 * gl_FragCoord.w));",
                "  #endif",
                "  return smoothstep(0.5 - afwidth, 0.5 + afwidth, value);",
                "}",

                "void main() {",
                "  vec4 texColor = texture2D(map, vUv);",
                "  float alpha = aastep(texColor.a);",
                "  gl_FragColor = vec4(color, opacity * alpha);",
                alphaTest === 0 ? "" : "  if (gl_FragColor.a < " + alphaTest + ") discard;",
                "}"
              ].join("\n")
            },
            opt
          );
        };
      },
      { "object-assign": 22 }
    ],
    36: [
      function(require, module, exports) {
        (function(global) {
          var loadFont = require("load-bmfont");
          //global.THREE = require('three')

          // A utility to load a font, then a texture
          module.exports = function(opt, cb) {
            loadFont(opt.font, function(err, font) {
              if (err) throw err;
              THREE.ImageUtils.loadTexture(opt.image, undefined, function(tex) {
                cb(font, tex);
              });
            });
          };
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
        ));
      },
      { "load-bmfont": 20, three: undefined }
    ],
    37: [
      function(require, module, exports) {
        (function(global) {
          /*
  This is an example of 3D rendering, using a
  signed distance field shader and standard derivatives
  for improved edge quality and scaling.

  We've also enabled anisotropy on the texture for
  crisp rendering at sharp angles.
 */

          //var createOrbitViewer = require('three-orbit-viewer')(THREE)
          var createText = require("../");
          var SDFShader = require("../shaders/sdf");
          var dragcontrols;

          // load up a 'fnt' and texture
          require("./load")(
            {
              font: "../../fonts/DejaVu-sdf.fnt",
              image: "../../fonts/DejaVu-sdf.png"
            },
            loadFont
          );

          var font_texture = null,
            font_material = null,
            font = null;

          function loadFont(_font, _texture) {
            font = _font;

            var maxAni = renderer.getMaxAnisotropy();
            font_texture = _texture;

            // setup our texture with some nice mipmapping etc
            font_texture.needsUpdate = true;
            font_texture.minFilter = THREE.LinearMipMapLinearFilter;
            font_texture.magFilter = THREE.LinearFilter;
            font_texture.generateMipmaps = true;
            font_texture.anisotropy = maxAni;
            // here we use 'three-bmfont-text/shaders/sdf'
            // to help us build a shader material
            font_material = new THREE.RawShaderMaterial(
              SDFShader({
                map: font_texture,
                side: THREE.DoubleSide,
                transparent: false,
                color: "rgb(0, 0, 0)"
              })
            );

            olf_callback && olf_callback();
          }

          var olf_callback = null;
          global.onFontLoad = function(cb) {
            if (font_material) {
              cb();
            } else {
              olf_callback = cb;
            }
          };

          THREE.ARText = function(copy) {
            if (!font_material) {
              console.error("Font not loaded yet, cant write SDF");
              return null;
            }

            // create our text geometry
            var geom = createText({
              text: copy, // the string to render
              font: font, // the bitmap font definition
              width: 1000 // optional width for word-wrap
            });
            var layout = geom.layout;
            var text = new THREE.Mesh(geom, font_material);
            text.rotateX(Math.PI);
            this.text = text;

            /* // ANCHOR object.
  var textAnchor = new THREE.Object3D()
  textAnchor.add(text)
  textAnchor.position.set(0,0,-100)
  scene.add(textAnchor)*/
          };
        }.call(
          this,
          typeof global !== "undefined"
            ? global
            : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {}
        ));
      },
      { "../": 5, "../shaders/sdf": 35, "./load": 36 }
    ]
  },
  {},
  [37]
);
