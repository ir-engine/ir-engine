import "./chunk-TFWDKVI3.js";

// ../../node_modules/msgpackr/unpack.js
var decoder;
try {
  decoder = new TextDecoder();
} catch (error) {
}
var src;
var srcEnd;
var position = 0;
var EMPTY_ARRAY = [];
var strings = EMPTY_ARRAY;
var stringPosition = 0;
var currentUnpackr = {};
var currentStructures;
var srcString;
var srcStringStart = 0;
var srcStringEnd = 0;
var bundledStrings;
var referenceMap;
var currentExtensions = [];
var dataView;
var defaultOptions = {
  useRecords: false,
  mapsAsObjects: true
};
var C1Type = class {
};
var C1 = new C1Type();
C1.name = "MessagePack 0xC1";
var sequentialMode = false;
var inlineObjectReadThreshold = 2;
var readStruct;
var onLoadedStructures;
var onSaveState;
try {
  new Function("");
} catch (error) {
  inlineObjectReadThreshold = Infinity;
}
var Unpackr = class {
  constructor(options) {
    if (options) {
      if (options.useRecords === false && options.mapsAsObjects === void 0)
        options.mapsAsObjects = true;
      if (options.sequential && options.trusted !== false) {
        options.trusted = true;
        if (!options.structures && options.useRecords != false) {
          options.structures = [];
          if (!options.maxSharedStructures)
            options.maxSharedStructures = 0;
        }
      }
      if (options.structures)
        options.structures.sharedLength = options.structures.length;
      else if (options.getStructures) {
        (options.structures = []).uninitialized = true;
        options.structures.sharedLength = 0;
      }
      if (options.int64AsNumber) {
        options.int64AsType = "number";
      }
    }
    Object.assign(this, options);
  }
  unpack(source, options) {
    if (src) {
      return saveState(() => {
        clearSource();
        return this ? this.unpack(source, options) : Unpackr.prototype.unpack.call(defaultOptions, source, options);
      });
    }
    if (typeof options === "object") {
      srcEnd = options.end || source.length;
      position = options.start || 0;
    } else {
      position = 0;
      srcEnd = options > -1 ? options : source.length;
    }
    stringPosition = 0;
    srcStringEnd = 0;
    srcString = null;
    strings = EMPTY_ARRAY;
    bundledStrings = null;
    src = source;
    try {
      dataView = source.dataView || (source.dataView = new DataView(source.buffer, source.byteOffset, source.byteLength));
    } catch (error) {
      src = null;
      if (source instanceof Uint8Array)
        throw error;
      throw new Error("Source must be a Uint8Array or Buffer but was a " + (source && typeof source == "object" ? source.constructor.name : typeof source));
    }
    if (this instanceof Unpackr) {
      currentUnpackr = this;
      if (this.structures) {
        currentStructures = this.structures;
        return checkedRead(options);
      } else if (!currentStructures || currentStructures.length > 0) {
        currentStructures = [];
      }
    } else {
      currentUnpackr = defaultOptions;
      if (!currentStructures || currentStructures.length > 0)
        currentStructures = [];
    }
    return checkedRead(options);
  }
  unpackMultiple(source, forEach) {
    let values, lastPosition = 0;
    try {
      sequentialMode = true;
      let size = source.length;
      let value = this ? this.unpack(source, size) : defaultUnpackr.unpack(source, size);
      if (forEach) {
        if (forEach(value) === false)
          return;
        while (position < size) {
          lastPosition = position;
          if (forEach(checkedRead()) === false) {
            return;
          }
        }
      } else {
        values = [value];
        while (position < size) {
          lastPosition = position;
          values.push(checkedRead());
        }
        return values;
      }
    } catch (error) {
      error.lastPosition = lastPosition;
      error.values = values;
      throw error;
    } finally {
      sequentialMode = false;
      clearSource();
    }
  }
  _mergeStructures(loadedStructures, existingStructures) {
    if (onLoadedStructures)
      loadedStructures = onLoadedStructures.call(this, loadedStructures);
    loadedStructures = loadedStructures || [];
    if (Object.isFrozen(loadedStructures))
      loadedStructures = loadedStructures.map((structure) => structure.slice(0));
    for (let i = 0, l = loadedStructures.length; i < l; i++) {
      let structure = loadedStructures[i];
      if (structure) {
        structure.isShared = true;
        if (i >= 32)
          structure.highByte = i - 32 >> 5;
      }
    }
    loadedStructures.sharedLength = loadedStructures.length;
    for (let id in existingStructures || []) {
      if (id >= 0) {
        let structure = loadedStructures[id];
        let existing = existingStructures[id];
        if (existing) {
          if (structure)
            (loadedStructures.restoreStructures || (loadedStructures.restoreStructures = []))[id] = structure;
          loadedStructures[id] = existing;
        }
      }
    }
    return this.structures = loadedStructures;
  }
  decode(source, end) {
    return this.unpack(source, end);
  }
};
function checkedRead(options) {
  try {
    if (!currentUnpackr.trusted && !sequentialMode) {
      let sharedLength = currentStructures.sharedLength || 0;
      if (sharedLength < currentStructures.length)
        currentStructures.length = sharedLength;
    }
    let result;
    if (currentUnpackr.randomAccessStructure && src[position] < 64 && src[position] >= 32 && readStruct) {
      result = readStruct(src, position, srcEnd, currentUnpackr);
      src = null;
      if (!(options && options.lazy) && result)
        result = result.toJSON();
      position = srcEnd;
    } else
      result = read();
    if (bundledStrings) {
      position = bundledStrings.postBundlePosition;
      bundledStrings = null;
    }
    if (position == srcEnd) {
      if (currentStructures && currentStructures.restoreStructures)
        restoreStructures();
      currentStructures = null;
      src = null;
      if (referenceMap)
        referenceMap = null;
    } else if (position > srcEnd) {
      throw new Error("Unexpected end of MessagePack data");
    } else if (!sequentialMode) {
      throw new Error("Data read, but end of buffer not reached " + JSON.stringify(result).slice(0, 100));
    }
    return result;
  } catch (error) {
    if (currentStructures && currentStructures.restoreStructures)
      restoreStructures();
    clearSource();
    if (error instanceof RangeError || error.message.startsWith("Unexpected end of buffer") || position > srcEnd) {
      error.incomplete = true;
    }
    throw error;
  }
}
function restoreStructures() {
  for (let id in currentStructures.restoreStructures) {
    currentStructures[id] = currentStructures.restoreStructures[id];
  }
  currentStructures.restoreStructures = null;
}
function read() {
  let token = src[position++];
  if (token < 160) {
    if (token < 128) {
      if (token < 64)
        return token;
      else {
        let structure = currentStructures[token & 63] || currentUnpackr.getStructures && loadStructures()[token & 63];
        if (structure) {
          if (!structure.read) {
            structure.read = createStructureReader(structure, token & 63);
          }
          return structure.read();
        } else
          return token;
      }
    } else if (token < 144) {
      token -= 128;
      if (currentUnpackr.mapsAsObjects) {
        let object = {};
        for (let i = 0; i < token; i++) {
          let key = readKey();
          if (key === "__proto__")
            key = "__proto_";
          object[key] = read();
        }
        return object;
      } else {
        let map = /* @__PURE__ */ new Map();
        for (let i = 0; i < token; i++) {
          map.set(read(), read());
        }
        return map;
      }
    } else {
      token -= 144;
      let array = new Array(token);
      for (let i = 0; i < token; i++) {
        array[i] = read();
      }
      if (currentUnpackr.freezeData)
        return Object.freeze(array);
      return array;
    }
  } else if (token < 192) {
    let length = token - 160;
    if (srcStringEnd >= position) {
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    }
    if (srcStringEnd == 0 && srcEnd < 140) {
      let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
      if (string != null)
        return string;
    }
    return readFixedString(length);
  } else {
    let value;
    switch (token) {
      case 192:
        return null;
      case 193:
        if (bundledStrings) {
          value = read();
          if (value > 0)
            return bundledStrings[1].slice(bundledStrings.position1, bundledStrings.position1 += value);
          else
            return bundledStrings[0].slice(bundledStrings.position0, bundledStrings.position0 -= value);
        }
        return C1;
      case 194:
        return false;
      case 195:
        return true;
      case 196:
        value = src[position++];
        if (value === void 0)
          throw new Error("Unexpected end of buffer");
        return readBin(value);
      case 197:
        value = dataView.getUint16(position);
        position += 2;
        return readBin(value);
      case 198:
        value = dataView.getUint32(position);
        position += 4;
        return readBin(value);
      case 199:
        return readExt(src[position++]);
      case 200:
        value = dataView.getUint16(position);
        position += 2;
        return readExt(value);
      case 201:
        value = dataView.getUint32(position);
        position += 4;
        return readExt(value);
      case 202:
        value = dataView.getFloat32(position);
        if (currentUnpackr.useFloat32 > 2) {
          let multiplier = mult10[(src[position] & 127) << 1 | src[position + 1] >> 7];
          position += 4;
          return (multiplier * value + (value > 0 ? 0.5 : -0.5) >> 0) / multiplier;
        }
        position += 4;
        return value;
      case 203:
        value = dataView.getFloat64(position);
        position += 8;
        return value;
      case 204:
        return src[position++];
      case 205:
        value = dataView.getUint16(position);
        position += 2;
        return value;
      case 206:
        value = dataView.getUint32(position);
        position += 4;
        return value;
      case 207:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getUint32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigUint64(position).toString();
        } else
          value = dataView.getBigUint64(position);
        position += 8;
        return value;
      case 208:
        return dataView.getInt8(position++);
      case 209:
        value = dataView.getInt16(position);
        position += 2;
        return value;
      case 210:
        value = dataView.getInt32(position);
        position += 4;
        return value;
      case 211:
        if (currentUnpackr.int64AsType === "number") {
          value = dataView.getInt32(position) * 4294967296;
          value += dataView.getUint32(position + 4);
        } else if (currentUnpackr.int64AsType === "string") {
          value = dataView.getBigInt64(position).toString();
        } else
          value = dataView.getBigInt64(position);
        position += 8;
        return value;
      case 212:
        value = src[position++];
        if (value == 114) {
          return recordDefinition(src[position++] & 63);
        } else {
          let extension = currentExtensions[value];
          if (extension) {
            if (extension.read) {
              position++;
              return extension.read(read());
            } else if (extension.noBuffer) {
              position++;
              return extension();
            } else
              return extension(src.subarray(position, ++position));
          } else
            throw new Error("Unknown extension " + value);
        }
      case 213:
        value = src[position];
        if (value == 114) {
          position++;
          return recordDefinition(src[position++] & 63, src[position++]);
        } else
          return readExt(2);
      case 214:
        return readExt(4);
      case 215:
        return readExt(8);
      case 216:
        return readExt(16);
      case 217:
        value = src[position++];
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString8(value);
      case 218:
        value = dataView.getUint16(position);
        position += 2;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString16(value);
      case 219:
        value = dataView.getUint32(position);
        position += 4;
        if (srcStringEnd >= position) {
          return srcString.slice(position - srcStringStart, (position += value) - srcStringStart);
        }
        return readString32(value);
      case 220:
        value = dataView.getUint16(position);
        position += 2;
        return readArray(value);
      case 221:
        value = dataView.getUint32(position);
        position += 4;
        return readArray(value);
      case 222:
        value = dataView.getUint16(position);
        position += 2;
        return readMap(value);
      case 223:
        value = dataView.getUint32(position);
        position += 4;
        return readMap(value);
      default:
        if (token >= 224)
          return token - 256;
        if (token === void 0) {
          let error = new Error("Unexpected end of MessagePack data");
          error.incomplete = true;
          throw error;
        }
        throw new Error("Unknown MessagePack token " + token);
    }
  }
}
var validName = /^[a-zA-Z_$][a-zA-Z\d_$]*$/;
function createStructureReader(structure, firstId) {
  function readObject() {
    if (readObject.count++ > inlineObjectReadThreshold) {
      let readObject2 = structure.read = new Function("r", "return function(){return " + (currentUnpackr.freezeData ? "Object.freeze" : "") + "({" + structure.map((key) => key === "__proto__" ? "__proto_:r()" : validName.test(key) ? key + ":r()" : "[" + JSON.stringify(key) + "]:r()").join(",") + "})}")(read);
      if (structure.highByte === 0)
        structure.read = createSecondByteReader(firstId, structure.read);
      return readObject2();
    }
    let object = {};
    for (let i = 0, l = structure.length; i < l; i++) {
      let key = structure[i];
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    if (currentUnpackr.freezeData)
      return Object.freeze(object);
    return object;
  }
  readObject.count = 0;
  if (structure.highByte === 0) {
    return createSecondByteReader(firstId, readObject);
  }
  return readObject;
}
var createSecondByteReader = (firstId, read0) => {
  return function() {
    let highByte = src[position++];
    if (highByte === 0)
      return read0();
    let id = firstId < 32 ? -(firstId + (highByte << 5)) : firstId + (highByte << 5);
    let structure = currentStructures[id] || loadStructures()[id];
    if (!structure) {
      throw new Error("Record id is not defined for " + id);
    }
    if (!structure.read)
      structure.read = createStructureReader(structure, firstId);
    return structure.read();
  };
};
function loadStructures() {
  let loadedStructures = saveState(() => {
    src = null;
    return currentUnpackr.getStructures();
  });
  return currentStructures = currentUnpackr._mergeStructures(loadedStructures, currentStructures);
}
var readFixedString = readStringJS;
var readString8 = readStringJS;
var readString16 = readStringJS;
var readString32 = readStringJS;
var isNativeAccelerationEnabled = false;
function readStringJS(length) {
  let result;
  if (length < 16) {
    if (result = shortStringInJS(length))
      return result;
  }
  if (length > 64 && decoder)
    return decoder.decode(src.subarray(position, position += length));
  const end = position + length;
  const units = [];
  result = "";
  while (position < end) {
    const byte1 = src[position++];
    if ((byte1 & 128) === 0) {
      units.push(byte1);
    } else if ((byte1 & 224) === 192) {
      const byte2 = src[position++] & 63;
      units.push((byte1 & 31) << 6 | byte2);
    } else if ((byte1 & 240) === 224) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      units.push((byte1 & 31) << 12 | byte2 << 6 | byte3);
    } else if ((byte1 & 248) === 240) {
      const byte2 = src[position++] & 63;
      const byte3 = src[position++] & 63;
      const byte4 = src[position++] & 63;
      let unit = (byte1 & 7) << 18 | byte2 << 12 | byte3 << 6 | byte4;
      if (unit > 65535) {
        unit -= 65536;
        units.push(unit >>> 10 & 1023 | 55296);
        unit = 56320 | unit & 1023;
      }
      units.push(unit);
    } else {
      units.push(byte1);
    }
    if (units.length >= 4096) {
      result += fromCharCode.apply(String, units);
      units.length = 0;
    }
  }
  if (units.length > 0) {
    result += fromCharCode.apply(String, units);
  }
  return result;
}
function readArray(length) {
  let array = new Array(length);
  for (let i = 0; i < length; i++) {
    array[i] = read();
  }
  if (currentUnpackr.freezeData)
    return Object.freeze(array);
  return array;
}
function readMap(length) {
  if (currentUnpackr.mapsAsObjects) {
    let object = {};
    for (let i = 0; i < length; i++) {
      let key = readKey();
      if (key === "__proto__")
        key = "__proto_";
      object[key] = read();
    }
    return object;
  } else {
    let map = /* @__PURE__ */ new Map();
    for (let i = 0; i < length; i++) {
      map.set(read(), read());
    }
    return map;
  }
}
var fromCharCode = String.fromCharCode;
function longStringInJS(length) {
  let start = position;
  let bytes = new Array(length);
  for (let i = 0; i < length; i++) {
    const byte = src[position++];
    if ((byte & 128) > 0) {
      position = start;
      return;
    }
    bytes[i] = byte;
  }
  return fromCharCode.apply(String, bytes);
}
function shortStringInJS(length) {
  if (length < 4) {
    if (length < 2) {
      if (length === 0)
        return "";
      else {
        let a = src[position++];
        if ((a & 128) > 1) {
          position -= 1;
          return;
        }
        return fromCharCode(a);
      }
    } else {
      let a = src[position++];
      let b = src[position++];
      if ((a & 128) > 0 || (b & 128) > 0) {
        position -= 2;
        return;
      }
      if (length < 3)
        return fromCharCode(a, b);
      let c = src[position++];
      if ((c & 128) > 0) {
        position -= 3;
        return;
      }
      return fromCharCode(a, b, c);
    }
  } else {
    let a = src[position++];
    let b = src[position++];
    let c = src[position++];
    let d = src[position++];
    if ((a & 128) > 0 || (b & 128) > 0 || (c & 128) > 0 || (d & 128) > 0) {
      position -= 4;
      return;
    }
    if (length < 6) {
      if (length === 4)
        return fromCharCode(a, b, c, d);
      else {
        let e = src[position++];
        if ((e & 128) > 0) {
          position -= 5;
          return;
        }
        return fromCharCode(a, b, c, d, e);
      }
    } else if (length < 8) {
      let e = src[position++];
      let f = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0) {
        position -= 6;
        return;
      }
      if (length < 7)
        return fromCharCode(a, b, c, d, e, f);
      let g = src[position++];
      if ((g & 128) > 0) {
        position -= 7;
        return;
      }
      return fromCharCode(a, b, c, d, e, f, g);
    } else {
      let e = src[position++];
      let f = src[position++];
      let g = src[position++];
      let h = src[position++];
      if ((e & 128) > 0 || (f & 128) > 0 || (g & 128) > 0 || (h & 128) > 0) {
        position -= 8;
        return;
      }
      if (length < 10) {
        if (length === 8)
          return fromCharCode(a, b, c, d, e, f, g, h);
        else {
          let i = src[position++];
          if ((i & 128) > 0) {
            position -= 9;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i);
        }
      } else if (length < 12) {
        let i = src[position++];
        let j = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0) {
          position -= 10;
          return;
        }
        if (length < 11)
          return fromCharCode(a, b, c, d, e, f, g, h, i, j);
        let k = src[position++];
        if ((k & 128) > 0) {
          position -= 11;
          return;
        }
        return fromCharCode(a, b, c, d, e, f, g, h, i, j, k);
      } else {
        let i = src[position++];
        let j = src[position++];
        let k = src[position++];
        let l = src[position++];
        if ((i & 128) > 0 || (j & 128) > 0 || (k & 128) > 0 || (l & 128) > 0) {
          position -= 12;
          return;
        }
        if (length < 14) {
          if (length === 12)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l);
          else {
            let m = src[position++];
            if ((m & 128) > 0) {
              position -= 13;
              return;
            }
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m);
          }
        } else {
          let m = src[position++];
          let n = src[position++];
          if ((m & 128) > 0 || (n & 128) > 0) {
            position -= 14;
            return;
          }
          if (length < 15)
            return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n);
          let o = src[position++];
          if ((o & 128) > 0) {
            position -= 15;
            return;
          }
          return fromCharCode(a, b, c, d, e, f, g, h, i, j, k, l, m, n, o);
        }
      }
    }
  }
}
function readOnlyJSString() {
  let token = src[position++];
  let length;
  if (token < 192) {
    length = token - 160;
  } else {
    switch (token) {
      case 217:
        length = src[position++];
        break;
      case 218:
        length = dataView.getUint16(position);
        position += 2;
        break;
      case 219:
        length = dataView.getUint32(position);
        position += 4;
        break;
      default:
        throw new Error("Expected string");
    }
  }
  return readStringJS(length);
}
function readBin(length) {
  return currentUnpackr.copyBuffers ? (
    // specifically use the copying slice (not the node one)
    Uint8Array.prototype.slice.call(src, position, position += length)
  ) : src.subarray(position, position += length);
}
function readExt(length) {
  let type = src[position++];
  if (currentExtensions[type]) {
    let end;
    return currentExtensions[type](src.subarray(position, end = position += length), (readPosition) => {
      position = readPosition;
      try {
        return read();
      } finally {
        position = end;
      }
    });
  } else
    throw new Error("Unknown extension type " + type);
}
var keyCache = new Array(4096);
function readKey() {
  let length = src[position++];
  if (length >= 160 && length < 192) {
    length = length - 160;
    if (srcStringEnd >= position)
      return srcString.slice(position - srcStringStart, (position += length) - srcStringStart);
    else if (!(srcStringEnd == 0 && srcEnd < 180))
      return readFixedString(length);
  } else {
    position--;
    return read().toString();
  }
  let key = (length << 5 ^ (length > 1 ? dataView.getUint16(position) : length > 0 ? src[position] : 0)) & 4095;
  let entry = keyCache[key];
  let checkPosition = position;
  let end = position + length - 3;
  let chunk;
  let i = 0;
  if (entry && entry.bytes == length) {
    while (checkPosition < end) {
      chunk = dataView.getUint32(checkPosition);
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
      checkPosition += 4;
    }
    end += 3;
    while (checkPosition < end) {
      chunk = src[checkPosition++];
      if (chunk != entry[i++]) {
        checkPosition = 1879048192;
        break;
      }
    }
    if (checkPosition === end) {
      position = checkPosition;
      return entry.string;
    }
    end -= 3;
    checkPosition = position;
  }
  entry = [];
  keyCache[key] = entry;
  entry.bytes = length;
  while (checkPosition < end) {
    chunk = dataView.getUint32(checkPosition);
    entry.push(chunk);
    checkPosition += 4;
  }
  end += 3;
  while (checkPosition < end) {
    chunk = src[checkPosition++];
    entry.push(chunk);
  }
  let string = length < 16 ? shortStringInJS(length) : longStringInJS(length);
  if (string != null)
    return entry.string = string;
  return entry.string = readFixedString(length);
}
var recordDefinition = (id, highByte) => {
  let structure = read().map((property) => property.toString());
  let firstByte = id;
  if (highByte !== void 0) {
    id = id < 32 ? -((highByte << 5) + id) : (highByte << 5) + id;
    structure.highByte = highByte;
  }
  let existingStructure = currentStructures[id];
  if (existingStructure && existingStructure.isShared) {
    (currentStructures.restoreStructures || (currentStructures.restoreStructures = []))[id] = existingStructure;
  }
  currentStructures[id] = structure;
  structure.read = createStructureReader(structure, firstByte);
  return structure.read();
};
currentExtensions[0] = () => {
};
currentExtensions[0].noBuffer = true;
currentExtensions[101] = () => {
  let data = read();
  return (globalThis[data[0]] || Error)(data[1]);
};
currentExtensions[105] = (data) => {
  let id = dataView.getUint32(position - 4);
  if (!referenceMap)
    referenceMap = /* @__PURE__ */ new Map();
  let token = src[position];
  let target2;
  if (token >= 144 && token < 160 || token == 220 || token == 221)
    target2 = [];
  else
    target2 = {};
  let refEntry = { target: target2 };
  referenceMap.set(id, refEntry);
  let targetProperties = read();
  if (refEntry.used)
    return Object.assign(target2, targetProperties);
  refEntry.target = targetProperties;
  return targetProperties;
};
currentExtensions[112] = (data) => {
  let id = dataView.getUint32(position - 4);
  let refEntry = referenceMap.get(id);
  refEntry.used = true;
  return refEntry.target;
};
currentExtensions[115] = () => new Set(read());
var typedArrays = ["Int8", "Uint8", "Uint8Clamped", "Int16", "Uint16", "Int32", "Uint32", "Float32", "Float64", "BigInt64", "BigUint64"].map((type) => type + "Array");
currentExtensions[116] = (data) => {
  let typeCode = data[0];
  let typedArrayName = typedArrays[typeCode];
  if (!typedArrayName)
    throw new Error("Could not find typed array for code " + typeCode);
  return new globalThis[typedArrayName](Uint8Array.prototype.slice.call(data, 1).buffer);
};
currentExtensions[120] = () => {
  let data = read();
  return new RegExp(data[0], data[1]);
};
var TEMP_BUNDLE = [];
currentExtensions[98] = (data) => {
  let dataSize = (data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3];
  let dataPosition = position;
  position += dataSize - data.length;
  bundledStrings = TEMP_BUNDLE;
  bundledStrings = [readOnlyJSString(), readOnlyJSString()];
  bundledStrings.position0 = 0;
  bundledStrings.position1 = 0;
  bundledStrings.postBundlePosition = position;
  position = dataPosition;
  return read();
};
currentExtensions[255] = (data) => {
  if (data.length == 4)
    return new Date((data[0] * 16777216 + (data[1] << 16) + (data[2] << 8) + data[3]) * 1e3);
  else if (data.length == 8)
    return new Date(
      ((data[0] << 22) + (data[1] << 14) + (data[2] << 6) + (data[3] >> 2)) / 1e6 + ((data[3] & 3) * 4294967296 + data[4] * 16777216 + (data[5] << 16) + (data[6] << 8) + data[7]) * 1e3
    );
  else if (data.length == 12)
    return new Date(
      ((data[0] << 24) + (data[1] << 16) + (data[2] << 8) + data[3]) / 1e6 + ((data[4] & 128 ? -281474976710656 : 0) + data[6] * 1099511627776 + data[7] * 4294967296 + data[8] * 16777216 + (data[9] << 16) + (data[10] << 8) + data[11]) * 1e3
    );
  else
    return new Date("invalid");
};
function saveState(callback) {
  if (onSaveState)
    onSaveState();
  let savedSrcEnd = srcEnd;
  let savedPosition = position;
  let savedStringPosition = stringPosition;
  let savedSrcStringStart = srcStringStart;
  let savedSrcStringEnd = srcStringEnd;
  let savedSrcString = srcString;
  let savedStrings = strings;
  let savedReferenceMap = referenceMap;
  let savedBundledStrings = bundledStrings;
  let savedSrc = new Uint8Array(src.slice(0, srcEnd));
  let savedStructures = currentStructures;
  let savedStructuresContents = currentStructures.slice(0, currentStructures.length);
  let savedPackr = currentUnpackr;
  let savedSequentialMode = sequentialMode;
  let value = callback();
  srcEnd = savedSrcEnd;
  position = savedPosition;
  stringPosition = savedStringPosition;
  srcStringStart = savedSrcStringStart;
  srcStringEnd = savedSrcStringEnd;
  srcString = savedSrcString;
  strings = savedStrings;
  referenceMap = savedReferenceMap;
  bundledStrings = savedBundledStrings;
  src = savedSrc;
  sequentialMode = savedSequentialMode;
  currentStructures = savedStructures;
  currentStructures.splice(0, currentStructures.length, ...savedStructuresContents);
  currentUnpackr = savedPackr;
  dataView = new DataView(src.buffer, src.byteOffset, src.byteLength);
  return value;
}
function clearSource() {
  src = null;
  referenceMap = null;
  currentStructures = null;
}
function addExtension(extension) {
  if (extension.unpack)
    currentExtensions[extension.type] = extension.unpack;
  else
    currentExtensions[extension.type] = extension;
}
var mult10 = new Array(147);
for (let i = 0; i < 256; i++) {
  mult10[i] = +("1e" + Math.floor(45.15 - i * 0.30103));
}
var Decoder = Unpackr;
var defaultUnpackr = new Unpackr({ useRecords: false });
var unpack = defaultUnpackr.unpack;
var unpackMultiple = defaultUnpackr.unpackMultiple;
var decode = defaultUnpackr.unpack;
var FLOAT32_OPTIONS = {
  NEVER: 0,
  ALWAYS: 1,
  DECIMAL_ROUND: 3,
  DECIMAL_FIT: 4
};
var f32Array = new Float32Array(1);
var u8Array = new Uint8Array(f32Array.buffer, 0, 4);
function roundFloat32(float32Number) {
  f32Array[0] = float32Number;
  let multiplier = mult10[(u8Array[3] & 127) << 1 | u8Array[2] >> 7];
  return (multiplier * float32Number + (float32Number > 0 ? 0.5 : -0.5) >> 0) / multiplier;
}

// ../../node_modules/msgpackr/pack.js
var textEncoder;
try {
  textEncoder = new TextEncoder();
} catch (error) {
}
var extensions;
var extensionClasses;
var hasNodeBuffer = typeof Buffer !== "undefined";
var ByteArrayAllocate = hasNodeBuffer ? function(length) {
  return Buffer.allocUnsafeSlow(length);
} : Uint8Array;
var ByteArray = hasNodeBuffer ? Buffer : Uint8Array;
var MAX_BUFFER_SIZE = hasNodeBuffer ? 4294967296 : 2144337920;
var target;
var keysTarget;
var targetView;
var position2 = 0;
var safeEnd;
var bundledStrings2 = null;
var writeStructSlots;
var MAX_BUNDLE_SIZE = 21760;
var hasNonLatin = /[\u0080-\uFFFF]/;
var RECORD_SYMBOL = Symbol("record-id");
var Packr = class extends Unpackr {
  constructor(options) {
    super(options);
    this.offset = 0;
    let typeBuffer;
    let start;
    let hasSharedUpdate;
    let structures;
    let referenceMap2;
    let encodeUtf8 = ByteArray.prototype.utf8Write ? function(string, position3) {
      return target.utf8Write(string, position3, 4294967295);
    } : textEncoder && textEncoder.encodeInto ? function(string, position3) {
      return textEncoder.encodeInto(string, target.subarray(position3)).written;
    } : false;
    let packr = this;
    if (!options)
      options = {};
    let isSequential = options && options.sequential;
    let hasSharedStructures = options.structures || options.saveStructures;
    let maxSharedStructures = options.maxSharedStructures;
    if (maxSharedStructures == null)
      maxSharedStructures = hasSharedStructures ? 32 : 0;
    if (maxSharedStructures > 8160)
      throw new Error("Maximum maxSharedStructure is 8160");
    if (options.structuredClone && options.moreTypes == void 0) {
      this.moreTypes = true;
    }
    let maxOwnStructures = options.maxOwnStructures;
    if (maxOwnStructures == null)
      maxOwnStructures = hasSharedStructures ? 32 : 64;
    if (!this.structures && options.useRecords != false)
      this.structures = [];
    let useTwoByteRecords = maxSharedStructures > 32 || maxOwnStructures + maxSharedStructures > 64;
    let sharedLimitId = maxSharedStructures + 64;
    let maxStructureId = maxSharedStructures + maxOwnStructures + 64;
    if (maxStructureId > 8256) {
      throw new Error("Maximum maxSharedStructure + maxOwnStructure is 8192");
    }
    let recordIdsToRemove = [];
    let transitionsCount = 0;
    let serializationsSinceTransitionRebuild = 0;
    this.pack = this.encode = function(value, encodeOptions) {
      if (!target) {
        target = new ByteArrayAllocate(8192);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, 8192));
        position2 = 0;
      }
      safeEnd = target.length - 10;
      if (safeEnd - position2 < 2048) {
        target = new ByteArrayAllocate(target.length);
        targetView = target.dataView || (target.dataView = new DataView(target.buffer, 0, target.length));
        safeEnd = target.length - 10;
        position2 = 0;
      } else
        position2 = position2 + 7 & 2147483640;
      start = position2;
      referenceMap2 = packr.structuredClone ? /* @__PURE__ */ new Map() : null;
      if (packr.bundleStrings && typeof value !== "string") {
        bundledStrings2 = [];
        bundledStrings2.size = Infinity;
      } else
        bundledStrings2 = null;
      structures = packr.structures;
      if (structures) {
        if (structures.uninitialized)
          structures = packr._mergeStructures(packr.getStructures());
        let sharedLength = structures.sharedLength || 0;
        if (sharedLength > maxSharedStructures) {
          throw new Error("Shared structures is larger than maximum shared structures, try increasing maxSharedStructures to " + structures.sharedLength);
        }
        if (!structures.transitions) {
          structures.transitions = /* @__PURE__ */ Object.create(null);
          for (let i = 0; i < sharedLength; i++) {
            let keys = structures[i];
            if (!keys)
              continue;
            let nextTransition, transition = structures.transitions;
            for (let j = 0, l = keys.length; j < l; j++) {
              let key = keys[j];
              nextTransition = transition[key];
              if (!nextTransition) {
                nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
              }
              transition = nextTransition;
            }
            transition[RECORD_SYMBOL] = i + 64;
          }
          this.lastNamedStructuresLength = sharedLength;
        }
        if (!isSequential) {
          structures.nextId = sharedLength + 64;
        }
      }
      if (hasSharedUpdate)
        hasSharedUpdate = false;
      try {
        if (packr.randomAccessStructure && value.constructor && value.constructor === Object)
          writeStruct(value);
        else
          pack2(value);
        let lastBundle = bundledStrings2;
        if (bundledStrings2)
          writeBundles(start, pack2, 0);
        if (referenceMap2 && referenceMap2.idsToInsert) {
          let idsToInsert = referenceMap2.idsToInsert.sort((a, b) => a.offset > b.offset ? 1 : -1);
          let i = idsToInsert.length;
          let incrementPosition = -1;
          while (lastBundle && i > 0) {
            let insertionPoint = idsToInsert[--i].offset + start;
            if (insertionPoint < lastBundle.stringsPosition + start && incrementPosition === -1)
              incrementPosition = 0;
            if (insertionPoint > lastBundle.position + start) {
              if (incrementPosition >= 0)
                incrementPosition += 6;
            } else {
              if (incrementPosition >= 0) {
                targetView.setUint32(
                  lastBundle.position + start,
                  targetView.getUint32(lastBundle.position + start) + incrementPosition
                );
                incrementPosition = -1;
              }
              lastBundle = lastBundle.previous;
              i++;
            }
          }
          if (incrementPosition >= 0 && lastBundle) {
            targetView.setUint32(
              lastBundle.position + start,
              targetView.getUint32(lastBundle.position + start) + incrementPosition
            );
          }
          position2 += idsToInsert.length * 6;
          if (position2 > safeEnd)
            makeRoom(position2);
          packr.offset = position2;
          let serialized = insertIds(target.subarray(start, position2), idsToInsert);
          referenceMap2 = null;
          return serialized;
        }
        packr.offset = position2;
        if (encodeOptions & REUSE_BUFFER_MODE) {
          target.start = start;
          target.end = position2;
          return target;
        }
        return target.subarray(start, position2);
      } finally {
        if (structures) {
          if (serializationsSinceTransitionRebuild < 10)
            serializationsSinceTransitionRebuild++;
          let sharedLength = structures.sharedLength || 0;
          if (structures.length > sharedLength)
            structures.length = sharedLength;
          if (transitionsCount > 1e4) {
            structures.transitions = null;
            serializationsSinceTransitionRebuild = 0;
            transitionsCount = 0;
            if (recordIdsToRemove.length > 0)
              recordIdsToRemove = [];
          } else if (recordIdsToRemove.length > 0 && !isSequential) {
            for (let i = 0, l = recordIdsToRemove.length; i < l; i++) {
              recordIdsToRemove[i][RECORD_SYMBOL] = 0;
            }
            recordIdsToRemove = [];
          }
          if (hasSharedUpdate && packr.saveStructures) {
            let returnBuffer = target.subarray(start, position2);
            let newSharedData = prepareStructures(structures, packr);
            if (packr.saveStructures(newSharedData, newSharedData.isCompatible) === false) {
              return packr.pack(value);
            }
            packr.lastNamedStructuresLength = sharedLength;
            return returnBuffer;
          }
        }
        if (encodeOptions & RESET_BUFFER_MODE)
          position2 = start;
      }
    };
    const packArray = (value) => {
      var length = value.length;
      if (length < 16) {
        target[position2++] = 144 | length;
      } else if (length < 65536) {
        target[position2++] = 220;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 221;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      for (let i = 0; i < length; i++) {
        pack2(value[i]);
      }
    };
    const pack2 = (value) => {
      if (position2 > safeEnd)
        target = makeRoom(position2);
      var type = typeof value;
      var length;
      if (type === "string") {
        let strLength = value.length;
        if (bundledStrings2 && strLength >= 4 && strLength < 4096) {
          if ((bundledStrings2.size += strLength) > MAX_BUNDLE_SIZE) {
            let extStart;
            let maxBytes2 = (bundledStrings2[0] ? bundledStrings2[0].length * 3 + bundledStrings2[1].length : 0) + 10;
            if (position2 + maxBytes2 > safeEnd)
              target = makeRoom(position2 + maxBytes2);
            let lastBundle;
            if (bundledStrings2.position) {
              lastBundle = bundledStrings2;
              target[position2] = 200;
              position2 += 3;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
              writeBundles(start, pack2, 0);
              targetView.setUint16(extStart + start - 3, position2 - start - extStart);
            } else {
              target[position2++] = 214;
              target[position2++] = 98;
              extStart = position2 - start;
              position2 += 4;
            }
            bundledStrings2 = ["", ""];
            bundledStrings2.previous = lastBundle;
            bundledStrings2.size = 0;
            bundledStrings2.position = extStart;
          }
          let twoByte = hasNonLatin.test(value);
          bundledStrings2[twoByte ? 0 : 1] += value;
          target[position2++] = 193;
          pack2(twoByte ? -strLength : strLength);
          return;
        }
        let headerSize;
        if (strLength < 32) {
          headerSize = 1;
        } else if (strLength < 256) {
          headerSize = 2;
        } else if (strLength < 65536) {
          headerSize = 3;
        } else {
          headerSize = 5;
        }
        let maxBytes = strLength * 3;
        if (position2 + maxBytes > safeEnd)
          target = makeRoom(position2 + maxBytes);
        if (strLength < 64 || !encodeUtf8) {
          let i, c1, c2, strPosition = position2 + headerSize;
          for (i = 0; i < strLength; i++) {
            c1 = value.charCodeAt(i);
            if (c1 < 128) {
              target[strPosition++] = c1;
            } else if (c1 < 2048) {
              target[strPosition++] = c1 >> 6 | 192;
              target[strPosition++] = c1 & 63 | 128;
            } else if ((c1 & 64512) === 55296 && ((c2 = value.charCodeAt(i + 1)) & 64512) === 56320) {
              c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
              i++;
              target[strPosition++] = c1 >> 18 | 240;
              target[strPosition++] = c1 >> 12 & 63 | 128;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            } else {
              target[strPosition++] = c1 >> 12 | 224;
              target[strPosition++] = c1 >> 6 & 63 | 128;
              target[strPosition++] = c1 & 63 | 128;
            }
          }
          length = strPosition - position2 - headerSize;
        } else {
          length = encodeUtf8(value, position2 + headerSize);
        }
        if (length < 32) {
          target[position2++] = 160 | length;
        } else if (length < 256) {
          if (headerSize < 2) {
            target.copyWithin(position2 + 2, position2 + 1, position2 + 1 + length);
          }
          target[position2++] = 217;
          target[position2++] = length;
        } else if (length < 65536) {
          if (headerSize < 3) {
            target.copyWithin(position2 + 3, position2 + 2, position2 + 2 + length);
          }
          target[position2++] = 218;
          target[position2++] = length >> 8;
          target[position2++] = length & 255;
        } else {
          if (headerSize < 5) {
            target.copyWithin(position2 + 5, position2 + 3, position2 + 3 + length);
          }
          target[position2++] = 219;
          targetView.setUint32(position2, length);
          position2 += 4;
        }
        position2 += length;
      } else if (type === "number") {
        if (value >>> 0 === value) {
          if (value < 32 || value < 128 && this.useRecords === false || value < 64 && !this.randomAccessStructure) {
            target[position2++] = value;
          } else if (value < 256) {
            target[position2++] = 204;
            target[position2++] = value;
          } else if (value < 65536) {
            target[position2++] = 205;
            target[position2++] = value >> 8;
            target[position2++] = value & 255;
          } else {
            target[position2++] = 206;
            targetView.setUint32(position2, value);
            position2 += 4;
          }
        } else if (value >> 0 === value) {
          if (value >= -32) {
            target[position2++] = 256 + value;
          } else if (value >= -128) {
            target[position2++] = 208;
            target[position2++] = value + 256;
          } else if (value >= -32768) {
            target[position2++] = 209;
            targetView.setInt16(position2, value);
            position2 += 2;
          } else {
            target[position2++] = 210;
            targetView.setInt32(position2, value);
            position2 += 4;
          }
        } else {
          let useFloat32;
          if ((useFloat32 = this.useFloat32) > 0 && value < 4294967296 && value >= -2147483648) {
            target[position2++] = 202;
            targetView.setFloat32(position2, value);
            let xShifted;
            if (useFloat32 < 4 || // this checks for rounding of numbers that were encoded in 32-bit float to nearest significant decimal digit that could be preserved
            (xShifted = value * mult10[(target[position2] & 127) << 1 | target[position2 + 1] >> 7]) >> 0 === xShifted) {
              position2 += 4;
              return;
            } else
              position2--;
          }
          target[position2++] = 203;
          targetView.setFloat64(position2, value);
          position2 += 8;
        }
      } else if (type === "object") {
        if (!value)
          target[position2++] = 192;
        else {
          if (referenceMap2) {
            let referee = referenceMap2.get(value);
            if (referee) {
              if (!referee.id) {
                let idsToInsert = referenceMap2.idsToInsert || (referenceMap2.idsToInsert = []);
                referee.id = idsToInsert.push(referee);
              }
              target[position2++] = 214;
              target[position2++] = 112;
              targetView.setUint32(position2, referee.id);
              position2 += 4;
              return;
            } else
              referenceMap2.set(value, { offset: position2 - start });
          }
          let constructor = value.constructor;
          if (constructor === Object) {
            writeObject(value, true);
          } else if (constructor === Array) {
            packArray(value);
          } else if (constructor === Map) {
            length = value.size;
            if (length < 16) {
              target[position2++] = 128 | length;
            } else if (length < 65536) {
              target[position2++] = 222;
              target[position2++] = length >> 8;
              target[position2++] = length & 255;
            } else {
              target[position2++] = 223;
              targetView.setUint32(position2, length);
              position2 += 4;
            }
            for (let [key, entryValue] of value) {
              pack2(key);
              pack2(entryValue);
            }
          } else {
            for (let i = 0, l = extensions.length; i < l; i++) {
              let extensionClass = extensionClasses[i];
              if (value instanceof extensionClass) {
                let extension = extensions[i];
                if (extension.write) {
                  if (extension.type) {
                    target[position2++] = 212;
                    target[position2++] = extension.type;
                    target[position2++] = 0;
                  }
                  let writeResult = extension.write.call(this, value);
                  if (writeResult === value) {
                    if (Array.isArray(value)) {
                      packArray(value);
                    } else {
                      writeObject(value);
                    }
                  } else {
                    pack2(writeResult);
                  }
                  return;
                }
                let currentTarget = target;
                let currentTargetView = targetView;
                let currentPosition = position2;
                target = null;
                let result;
                try {
                  result = extension.pack.call(this, value, (size) => {
                    target = currentTarget;
                    currentTarget = null;
                    position2 += size;
                    if (position2 > safeEnd)
                      makeRoom(position2);
                    return {
                      target,
                      targetView,
                      position: position2 - size
                    };
                  }, pack2);
                } finally {
                  if (currentTarget) {
                    target = currentTarget;
                    targetView = currentTargetView;
                    position2 = currentPosition;
                    safeEnd = target.length - 10;
                  }
                }
                if (result) {
                  if (result.length + position2 > safeEnd)
                    makeRoom(result.length + position2);
                  position2 = writeExtensionData(result, target, position2, extension.type);
                }
                return;
              }
            }
            if (Array.isArray(value)) {
              packArray(value);
            } else {
              writeObject(value, !value.hasOwnProperty);
            }
          }
        }
      } else if (type === "boolean") {
        target[position2++] = value ? 195 : 194;
      } else if (type === "bigint") {
        if (value < BigInt(1) << BigInt(63) && value >= -(BigInt(1) << BigInt(63))) {
          target[position2++] = 211;
          targetView.setBigInt64(position2, value);
        } else if (value < BigInt(1) << BigInt(64) && value > 0) {
          target[position2++] = 207;
          targetView.setBigUint64(position2, value);
        } else {
          if (this.largeBigIntToFloat) {
            target[position2++] = 203;
            targetView.setFloat64(position2, Number(value));
          } else {
            throw new RangeError(value + " was too large to fit in MessagePack 64-bit integer format, set largeBigIntToFloat to convert to float-64");
          }
        }
        position2 += 8;
      } else if (type === "undefined") {
        if (this.encodeUndefinedAsNil)
          target[position2++] = 192;
        else {
          target[position2++] = 212;
          target[position2++] = 0;
          target[position2++] = 0;
        }
      } else if (type === "function") {
        pack2(this.writeFunction && this.writeFunction());
      } else {
        throw new Error("Unknown type: " + type);
      }
    };
    const writeObject = this.useRecords === false ? this.variableMapSize ? (object) => {
      let keys = Object.keys(object);
      let length = keys.length;
      if (length < 16) {
        target[position2++] = 128 | length;
      } else if (length < 65536) {
        target[position2++] = 222;
        target[position2++] = length >> 8;
        target[position2++] = length & 255;
      } else {
        target[position2++] = 223;
        targetView.setUint32(position2, length);
        position2 += 4;
      }
      let key;
      for (let i = 0; i < length; i++) {
        pack2(key = keys[i]);
        pack2(object[key]);
      }
    } : (object, safePrototype) => {
      target[position2++] = 222;
      let objectOffset = position2 - start;
      position2 += 2;
      let size = 0;
      for (let key in object) {
        if (safePrototype || object.hasOwnProperty(key)) {
          pack2(key);
          pack2(object[key]);
          size++;
        }
      }
      target[objectOffset++ + start] = size >> 8;
      target[objectOffset + start] = size & 255;
    } : options.progressiveRecords && !useTwoByteRecords ? (
      // this is about 2% faster for highly stable structures, since it only requires one for-in loop (but much more expensive when new structure needs to be written)
      (object, safePrototype) => {
        let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
        let objectOffset = position2++ - start;
        let wroteKeys;
        for (let key in object) {
          if (safePrototype || object.hasOwnProperty(key)) {
            nextTransition = transition[key];
            if (nextTransition)
              transition = nextTransition;
            else {
              let keys = Object.keys(object);
              let lastTransition = transition;
              transition = structures.transitions;
              let newTransitions = 0;
              for (let i = 0, l = keys.length; i < l; i++) {
                let key2 = keys[i];
                nextTransition = transition[key2];
                if (!nextTransition) {
                  nextTransition = transition[key2] = /* @__PURE__ */ Object.create(null);
                  newTransitions++;
                }
                transition = nextTransition;
              }
              if (objectOffset + start + 1 == position2) {
                position2--;
                newRecord(transition, keys, newTransitions);
              } else
                insertNewRecord(transition, keys, objectOffset, newTransitions);
              wroteKeys = true;
              transition = lastTransition[key];
            }
            pack2(object[key]);
          }
        }
        if (!wroteKeys) {
          let recordId = transition[RECORD_SYMBOL];
          if (recordId)
            target[objectOffset + start] = recordId;
          else
            insertNewRecord(transition, Object.keys(object), objectOffset, 0);
        }
      }
    ) : (object, safePrototype) => {
      let nextTransition, transition = structures.transitions || (structures.transitions = /* @__PURE__ */ Object.create(null));
      let newTransitions = 0;
      for (let key in object)
        if (safePrototype || object.hasOwnProperty(key)) {
          nextTransition = transition[key];
          if (!nextTransition) {
            nextTransition = transition[key] = /* @__PURE__ */ Object.create(null);
            newTransitions++;
          }
          transition = nextTransition;
        }
      let recordId = transition[RECORD_SYMBOL];
      if (recordId) {
        if (recordId >= 96 && useTwoByteRecords) {
          target[position2++] = ((recordId -= 96) & 31) + 96;
          target[position2++] = recordId >> 5;
        } else
          target[position2++] = recordId;
      } else {
        newRecord(transition, transition.__keys__ || Object.keys(object), newTransitions);
      }
      for (let key in object)
        if (safePrototype || object.hasOwnProperty(key))
          pack2(object[key]);
    };
    const makeRoom = (end) => {
      let newSize;
      if (end > 16777216) {
        if (end - start > MAX_BUFFER_SIZE)
          throw new Error("Packed buffer would be larger than maximum buffer size");
        newSize = Math.min(
          MAX_BUFFER_SIZE,
          Math.round(Math.max((end - start) * (end > 67108864 ? 1.25 : 2), 4194304) / 4096) * 4096
        );
      } else
        newSize = (Math.max(end - start << 2, target.length - 1) >> 12) + 1 << 12;
      let newBuffer = new ByteArrayAllocate(newSize);
      targetView = newBuffer.dataView || (newBuffer.dataView = new DataView(newBuffer.buffer, 0, newSize));
      end = Math.min(end, target.length);
      if (target.copy)
        target.copy(newBuffer, 0, start, end);
      else
        newBuffer.set(target.slice(start, end));
      position2 -= start;
      start = 0;
      safeEnd = newBuffer.length - 10;
      return target = newBuffer;
    };
    const newRecord = (transition, keys, newTransitions) => {
      let recordId = structures.nextId;
      if (!recordId)
        recordId = 64;
      if (recordId < sharedLimitId && this.shouldShareStructure && !this.shouldShareStructure(keys)) {
        recordId = structures.nextOwnId;
        if (!(recordId < maxStructureId))
          recordId = sharedLimitId;
        structures.nextOwnId = recordId + 1;
      } else {
        if (recordId >= maxStructureId)
          recordId = sharedLimitId;
        structures.nextId = recordId + 1;
      }
      let highByte = keys.highByte = recordId >= 96 && useTwoByteRecords ? recordId - 96 >> 5 : -1;
      transition[RECORD_SYMBOL] = recordId;
      transition.__keys__ = keys;
      structures[recordId - 64] = keys;
      if (recordId < sharedLimitId) {
        keys.isShared = true;
        structures.sharedLength = recordId - 63;
        hasSharedUpdate = true;
        if (highByte >= 0) {
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = recordId;
        }
      } else {
        if (highByte >= 0) {
          target[position2++] = 213;
          target[position2++] = 114;
          target[position2++] = (recordId & 31) + 96;
          target[position2++] = highByte;
        } else {
          target[position2++] = 212;
          target[position2++] = 114;
          target[position2++] = recordId;
        }
        if (newTransitions)
          transitionsCount += serializationsSinceTransitionRebuild * newTransitions;
        if (recordIdsToRemove.length >= maxOwnStructures)
          recordIdsToRemove.shift()[RECORD_SYMBOL] = 0;
        recordIdsToRemove.push(transition);
        pack2(keys);
      }
    };
    const insertNewRecord = (transition, keys, insertionOffset, newTransitions) => {
      let mainTarget = target;
      let mainPosition = position2;
      let mainSafeEnd = safeEnd;
      let mainStart = start;
      target = keysTarget;
      position2 = 0;
      start = 0;
      if (!target)
        keysTarget = target = new ByteArrayAllocate(8192);
      safeEnd = target.length - 10;
      newRecord(transition, keys, newTransitions);
      keysTarget = target;
      let keysPosition = position2;
      target = mainTarget;
      position2 = mainPosition;
      safeEnd = mainSafeEnd;
      start = mainStart;
      if (keysPosition > 1) {
        let newEnd = position2 + keysPosition - 1;
        if (newEnd > safeEnd)
          makeRoom(newEnd);
        let insertionPosition = insertionOffset + start;
        target.copyWithin(insertionPosition + keysPosition, insertionPosition + 1, position2);
        target.set(keysTarget.slice(0, keysPosition), insertionPosition);
        position2 = newEnd;
      } else {
        target[insertionOffset + start] = keysTarget[0];
      }
    };
    const writeStruct = (object, safePrototype) => {
      let newPosition = writeStructSlots(object, target, position2, structures, makeRoom, (value, newPosition2, notifySharedUpdate) => {
        if (notifySharedUpdate)
          return hasSharedUpdate = true;
        position2 = newPosition2;
        let startTarget = target;
        pack2(value);
        if (startTarget !== target) {
          return { position: position2, targetView, target };
        }
        return position2;
      }, this);
      if (newPosition === 0)
        return writeObject(object, true);
      position2 = newPosition;
    };
  }
  useBuffer(buffer) {
    target = buffer;
    targetView = new DataView(target.buffer, target.byteOffset, target.byteLength);
    position2 = 0;
  }
  clearSharedData() {
    if (this.structures)
      this.structures = [];
    if (this.typedStructs)
      this.typedStructs = [];
  }
};
extensionClasses = [Date, Set, Error, RegExp, ArrayBuffer, Object.getPrototypeOf(Uint8Array.prototype).constructor, C1Type];
extensions = [{
  pack(date, allocateForWrite, pack2) {
    let seconds = date.getTime() / 1e3;
    if ((this.useTimestamp32 || date.getMilliseconds() === 0) && seconds >= 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(6);
      target2[position3++] = 214;
      target2[position3++] = 255;
      targetView2.setUint32(position3, seconds);
    } else if (seconds > 0 && seconds < 4294967296) {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(10);
      target2[position3++] = 215;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 4e6 + (seconds / 1e3 / 4294967296 >> 0));
      targetView2.setUint32(position3 + 4, seconds);
    } else if (isNaN(seconds)) {
      if (this.onInvalidDate) {
        allocateForWrite(0);
        return pack2(this.onInvalidDate());
      }
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(3);
      target2[position3++] = 212;
      target2[position3++] = 255;
      target2[position3++] = 255;
    } else {
      let { target: target2, targetView: targetView2, position: position3 } = allocateForWrite(15);
      target2[position3++] = 199;
      target2[position3++] = 12;
      target2[position3++] = 255;
      targetView2.setUint32(position3, date.getMilliseconds() * 1e6);
      targetView2.setBigInt64(position3 + 4, BigInt(Math.floor(seconds)));
    }
  }
}, {
  pack(set, allocateForWrite, pack2) {
    let array = Array.from(set);
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 115;
      target2[position3++] = 0;
    }
    pack2(array);
  }
}, {
  pack(error, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 101;
      target2[position3++] = 0;
    }
    pack2([error.name, error.message]);
  }
}, {
  pack(regex, allocateForWrite, pack2) {
    let { target: target2, position: position3 } = allocateForWrite(this.moreTypes ? 3 : 0);
    if (this.moreTypes) {
      target2[position3++] = 212;
      target2[position3++] = 120;
      target2[position3++] = 0;
    }
    pack2([regex.source, regex.flags]);
  }
}, {
  pack(arrayBuffer, allocateForWrite) {
    if (this.moreTypes)
      writeExtBuffer(arrayBuffer, 16, allocateForWrite);
    else
      writeBuffer(hasNodeBuffer ? Buffer.from(arrayBuffer) : new Uint8Array(arrayBuffer), allocateForWrite);
  }
}, {
  pack(typedArray, allocateForWrite) {
    let constructor = typedArray.constructor;
    if (constructor !== ByteArray && this.moreTypes)
      writeExtBuffer(typedArray, typedArrays.indexOf(constructor.name), allocateForWrite);
    else
      writeBuffer(typedArray, allocateForWrite);
  }
}, {
  pack(c1, allocateForWrite) {
    let { target: target2, position: position3 } = allocateForWrite(1);
    target2[position3] = 193;
  }
}];
function writeExtBuffer(typedArray, type, allocateForWrite, encode2) {
  let length = typedArray.byteLength;
  if (length + 1 < 256) {
    var { target: target2, position: position3 } = allocateForWrite(4 + length);
    target2[position3++] = 199;
    target2[position3++] = length + 1;
  } else if (length + 1 < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(5 + length);
    target2[position3++] = 200;
    target2[position3++] = length + 1 >> 8;
    target2[position3++] = length + 1 & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(7 + length);
    target2[position3++] = 201;
    targetView2.setUint32(position3, length + 1);
    position3 += 4;
  }
  target2[position3++] = 116;
  target2[position3++] = type;
  target2.set(new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength), position3);
}
function writeBuffer(buffer, allocateForWrite) {
  let length = buffer.byteLength;
  var target2, position3;
  if (length < 256) {
    var { target: target2, position: position3 } = allocateForWrite(length + 2);
    target2[position3++] = 196;
    target2[position3++] = length;
  } else if (length < 65536) {
    var { target: target2, position: position3 } = allocateForWrite(length + 3);
    target2[position3++] = 197;
    target2[position3++] = length >> 8;
    target2[position3++] = length & 255;
  } else {
    var { target: target2, position: position3, targetView: targetView2 } = allocateForWrite(length + 5);
    target2[position3++] = 198;
    targetView2.setUint32(position3, length);
    position3 += 4;
  }
  target2.set(buffer, position3);
}
function writeExtensionData(result, target2, position3, type) {
  let length = result.length;
  switch (length) {
    case 1:
      target2[position3++] = 212;
      break;
    case 2:
      target2[position3++] = 213;
      break;
    case 4:
      target2[position3++] = 214;
      break;
    case 8:
      target2[position3++] = 215;
      break;
    case 16:
      target2[position3++] = 216;
      break;
    default:
      if (length < 256) {
        target2[position3++] = 199;
        target2[position3++] = length;
      } else if (length < 65536) {
        target2[position3++] = 200;
        target2[position3++] = length >> 8;
        target2[position3++] = length & 255;
      } else {
        target2[position3++] = 201;
        target2[position3++] = length >> 24;
        target2[position3++] = length >> 16 & 255;
        target2[position3++] = length >> 8 & 255;
        target2[position3++] = length & 255;
      }
  }
  target2[position3++] = type;
  target2.set(result, position3);
  position3 += length;
  return position3;
}
function insertIds(serialized, idsToInsert) {
  let nextId;
  let distanceToMove = idsToInsert.length * 6;
  let lastEnd = serialized.length - distanceToMove;
  while (nextId = idsToInsert.pop()) {
    let offset = nextId.offset;
    let id = nextId.id;
    serialized.copyWithin(offset + distanceToMove, offset, lastEnd);
    distanceToMove -= 6;
    let position3 = offset + distanceToMove;
    serialized[position3++] = 214;
    serialized[position3++] = 105;
    serialized[position3++] = id >> 24;
    serialized[position3++] = id >> 16 & 255;
    serialized[position3++] = id >> 8 & 255;
    serialized[position3++] = id & 255;
    lastEnd = offset;
  }
  return serialized;
}
function writeBundles(start, pack2, incrementPosition) {
  if (bundledStrings2.length > 0) {
    targetView.setUint32(bundledStrings2.position + start, position2 + incrementPosition - bundledStrings2.position - start);
    bundledStrings2.stringsPosition = position2 - start;
    let writeStrings = bundledStrings2;
    bundledStrings2 = null;
    pack2(writeStrings[0]);
    pack2(writeStrings[1]);
  }
}
function addExtension2(extension) {
  if (extension.Class) {
    if (!extension.pack && !extension.write)
      throw new Error("Extension has no pack or write function");
    if (extension.pack && !extension.type)
      throw new Error("Extension has no type (numeric code to identify the extension)");
    extensionClasses.unshift(extension.Class);
    extensions.unshift(extension);
  }
  addExtension(extension);
}
function prepareStructures(structures, packr) {
  structures.isCompatible = (existingStructures) => {
    let compatible = !existingStructures || (packr.lastNamedStructuresLength || 0) === existingStructures.length;
    if (!compatible)
      packr._mergeStructures(existingStructures);
    return compatible;
  };
  return structures;
}
var defaultPackr = new Packr({ useRecords: false });
var pack = defaultPackr.pack;
var encode = defaultPackr.pack;
var Encoder = Packr;
var { NEVER, ALWAYS, DECIMAL_ROUND, DECIMAL_FIT } = FLOAT32_OPTIONS;
var REUSE_BUFFER_MODE = 512;
var RESET_BUFFER_MODE = 1024;

// ../../node_modules/msgpackr/iterators.js
function packIter(objectIterator, options = {}) {
  if (!objectIterator || typeof objectIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, or a Promise for an Async Iterable");
  } else if (typeof objectIterator[Symbol.iterator] === "function") {
    return packIterSync(objectIterator, options);
  } else if (typeof objectIterator.then === "function" || typeof objectIterator[Symbol.asyncIterator] === "function") {
    return packIterAsync(objectIterator, options);
  } else {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a Promise");
  }
}
function* packIterSync(objectIterator, options) {
  const packr = new Packr(options);
  for (const value of objectIterator) {
    yield packr.pack(value);
  }
}
async function* packIterAsync(objectIterator, options) {
  const packr = new Packr(options);
  for await (const value of objectIterator) {
    yield packr.pack(value);
  }
}
function unpackIter(bufferIterator, options = {}) {
  if (!bufferIterator || typeof bufferIterator !== "object") {
    throw new Error("first argument must be an Iterable, Async Iterable, Iterator, Async Iterator, or a promise");
  }
  const unpackr = new Unpackr(options);
  let incomplete;
  const parser = (chunk) => {
    let yields;
    if (incomplete) {
      chunk = Buffer.concat([incomplete, chunk]);
      incomplete = void 0;
    }
    try {
      yields = unpackr.unpackMultiple(chunk);
    } catch (err) {
      if (err.incomplete) {
        incomplete = chunk.slice(err.lastPosition);
        yields = err.values;
      } else {
        throw err;
      }
    }
    return yields;
  };
  if (typeof bufferIterator[Symbol.iterator] === "function") {
    return function* iter() {
      for (const value of bufferIterator) {
        yield* parser(value);
      }
    }();
  } else if (typeof bufferIterator[Symbol.asyncIterator] === "function") {
    return async function* iter() {
      for await (const value of bufferIterator) {
        yield* parser(value);
      }
    }();
  }
}
var decodeIter = unpackIter;
var encodeIter = packIter;

// ../../node_modules/msgpackr/index.js
var useRecords = false;
var mapsAsObjects = true;
export {
  ALWAYS,
  C1,
  DECIMAL_FIT,
  DECIMAL_ROUND,
  Decoder,
  Encoder,
  FLOAT32_OPTIONS,
  NEVER,
  Packr,
  REUSE_BUFFER_MODE,
  Unpackr,
  addExtension2 as addExtension,
  clearSource,
  decode,
  decodeIter,
  encode,
  encodeIter,
  isNativeAccelerationEnabled,
  mapsAsObjects,
  pack,
  roundFloat32,
  unpack,
  unpackMultiple,
  useRecords
};
//# sourceMappingURL=msgpackr.js.map
