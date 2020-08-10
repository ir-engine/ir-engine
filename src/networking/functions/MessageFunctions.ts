import { cropString } from "../../common/functions/cropString"
import { set } from "../../common/functions/set"
import { MessageSchema } from "../classes/MessageSchema"
import { Network as NetworkComponent } from "../components/Network"
import { MessageTypeAlias } from "../types/MessageTypeAlias"
let _schema: MessageSchema<any>
let _buffer: ArrayBuffer = new ArrayBuffer(0)
let _dataView: DataView = new DataView(_buffer)
let _bytes = 0

export function toBuffer(input: MessageSchema<any>): ArrayBuffer {
  // deep clone the worldState
  const data = { ...input }

  _buffer = new ArrayBuffer(8 * 1024)
  _dataView = new DataView(_buffer)
  _bytes = 0
  const flat = flattenSchema(_schema, data)

  // to buffer
  flat.forEach((f: any) => {
    if (f.t === "String8") {
      for (let j = 0; j < f.d.length; j++) {
        _dataView.setUint8(_bytes, f.d[j].charCodeAt(0))
        _bytes++
      }
    } else if (f.t === "String16") {
      for (let j = 0; j < f.d.length; j++) {
        _dataView.setUint16(_bytes, f.d[j].charCodeAt(0))
        _bytes += 2
      }
    } else if (f.t === "Int8Array") {
      _dataView.setInt8(_bytes, f.d)
      _bytes++
    } else if (f.t === "Uint8Array") {
      _dataView.setUint8(_bytes, f.d)
      _bytes++
    } else if (f.t === "Int16Array") {
      _dataView.setInt16(_bytes, f.d)
      _bytes += 2
    } else if (f.t === "Uint16Array") {
      _dataView.setUint16(_bytes, f.d)
      _bytes += 2
    } else if (f.t === "Int32Array") {
      _dataView.setInt32(_bytes, f.d)
      _bytes += 4
    } else if (f.t === "Uint32Array") {
      _dataView.setUint32(_bytes, f.d)
      _bytes += 4
    } else if (f.t === "BigInt64Array") {
      _dataView.setBigInt64(_bytes, BigInt(f.d))
      _bytes += 8
    } else if (f.t === "BigUint64Array") {
      _dataView.setBigUint64(_bytes, BigInt(f.d))
      _bytes += 8
    } else if (f.t === "Float32Array") {
      _dataView.setFloat32(_bytes, f.d)
      _bytes += 4
    } else if (f.t === "Float64Array") {
      _dataView.setFloat64(_bytes, f.d)
      _bytes += 8
    }
  })

  // TODO: Pooling
  const newBuffer = new ArrayBuffer(_bytes)
  const view = new DataView(newBuffer)

  // copy all data to a new (resized) ArrayBuffer
  for (let i = 0; i < _bytes; i++) {
    view.setUint8(i, _dataView.getUint8(i))
  }

  return newBuffer
}

export function fromBuffer(buffer: ArrayBuffer) {
  // check where, in the buffer, the schemas are
  let index = 0
  const indexes: number[] = []

  const view = new DataView(buffer)
  const int8 = Array.from(new Int8Array(buffer))

  //TODO: WTF is this black magic?
  while (index > -1) {
    index = int8.indexOf(35, index)
    if (index !== -1) {
      indexes.push(index)
      index++
    }
  }
  // get the schema ids
  const schemaIds: MessageTypeAlias[] = []
  indexes.forEach(index => {
    let id = 0
    for (let i = 0; i < 5; i++) {
      const char = int8[index + i]
      id += char
    }
    schemaIds.push(id)
  })

  // assemble all info about the schemas we need
  const schemas: { id: MessageTypeAlias; schema: any; startsAt: number }[] = []
  schemaIds.forEach((id, i) => {
    // check if the schemaId exists
    // (this can be, for example, if charCode 35 is not really a #)
    const schemaId = NetworkComponent.instance.schema.messageSchemas[id]
    if (schemaId) schemas.push({ id, schema: NetworkComponent.instance.schema.messageSchemas[id], startsAt: indexes[i] + 5 })
  })
  // schemas[] contains now all the schemas we need to fromBuffer the bufferArray
  // lets begin the serialization
  let data: any = {} // holds all the data we want to give back
  let bytes = 0 // the current bytes of arrayBuffer iteration
  const dataPerSchema: any = {}

  const deserializeSchema = (struct: any) => {
    let data = {}
    if (typeof struct === "object") {
      for (const property in struct) {
        const prop = struct[property]

        // handle specialTypes e.g.:  "x: { type: int16, digits: 2 }"
        let specialTypes
        if (prop?.type?._type && prop?.type?._bytes) {
          specialTypes = prop
          prop._type = prop.type._type
          prop._bytes = prop.type._bytes
        }

        if (prop && prop["_type"] && prop["_bytes"]) {
          const _type = prop["_type"]
          const _bytes = prop["_bytes"]
          let value

          if (_type === "String8") {
            value = ""
            const length = prop.length || 12
            for (let i = 0; i < length; i++) {
              const char = String.fromCharCode(view.getUint8(bytes))
              value += char
              bytes++
            }
          } else if (_type === "String16") {
            value = ""
            const length = prop.length || 12
            for (let i = 0; i < length; i++) {
              const char = String.fromCharCode(view.getUint16(bytes))
              value += char
              bytes += 2
            }
          } else if (_type === "Int8Array") {
            value = view.getInt8(bytes)
            bytes += _bytes
          } else if (_type === "Uint8Array") {
            value = view.getUint8(bytes)
            bytes += _bytes
          } else if (_type === "Int16Array") {
            value = view.getInt16(bytes)
            bytes += _bytes
          } else if (_type === "Uint16Array") {
            value = view.getUint16(bytes)
            bytes += _bytes
          } else if (_type === "Int32Array") {
            value = view.getInt32(bytes)
            bytes += _bytes
          } else if (_type === "Uint32Array") {
            value = view.getUint32(bytes)
            bytes += _bytes
          } else if (_type === "BigInt64Array") {
            value = parseInt(view.getBigInt64(bytes).toString())
            bytes += _bytes
          } else if (_type === "BigUint64Array") {
            value = parseInt(view.getBigUint64(bytes).toString())
            bytes += _bytes
          } else if (_type === "Float32Array") {
            value = view.getFloat32(bytes)
            bytes += _bytes
          } else if (_type === "Float64Array") {
            value = view.getFloat64(bytes)
            bytes += _bytes
          }
          // apply special types options
          else if (typeof value === "number" && specialTypes?.digits) {
            value *= Math.pow(10, -specialTypes.digits)
            value = parseFloat(value.toFixed(specialTypes.digits))
          }

          data = { ...data, [property]: value }
        }
      }
    }
    return data
  }

  schemas.forEach((s, i) => {
    const struct = s.schema?.struct
    const start = s.startsAt
    let end = buffer.byteLength
    const id = s.schema?.id || "XX"

    if (id === "XX") console.error("ERROR: Something went horribly wrong!")

    end = schemas[i + 1].startsAt - 5

    // TODO: bytes is not accurate since it includes child schemas
    const length = s.schema?.bytes || 1
    // determine how many iteration we have to make in this schema
    // the players array maybe contains 5 player, so we have to make 5 iterations
    const iterations = (end - start) / length

    for (let i = 0; i < iterations; i++) {
      bytes = start + i * length
      // gets the data from this schema
      const schemaData = deserializeSchema(struct)

      if (iterations <= 1) dataPerSchema[id] = { ...schemaData }
      else {
        if (typeof dataPerSchema[id] === "undefined") dataPerSchema[id] = []
        dataPerSchema[id].push(schemaData)
      }
    }
  })

  // add dataPerScheme to data
  data = {}

  for (let i = 0; i < Object.keys(dataPerSchema).length; i++) {
    const key = Object.keys(dataPerSchema)[i]
    const value = dataPerSchema[key]
    populateData(data, _schema, key, value, "")
  }

  return data
}

export const populateData = (data, obj: any, key: any, value: any, path = "", isArray = false) => {
  if (obj && obj._id && obj._id === key) {
    const p = path.replace(/_struct\./, "").replace(/\.$/, "")
    // if it is a schema[], but only has one set, we manually have to make sure it transforms to an array
    if (isArray && !Array.isArray(value)) value = [value]
    // '' is the top level
    if (p === "") data = { ...data, ...value }
    else set(data, p, value)
  } else {
    for (const props in obj) {
      if (typeof obj[props] === "object") {
        const p = Array.isArray(obj) ? "" : `${props}.`
        populateData(data, obj[props], key, value, path + p, Array.isArray(obj))
      }
      //obj
    }
  }
}

export function flattenSchema(schema: MessageSchema<any>, data: any): any[] {
  const flat: any[] = []

  const flatten = (schema: any, data: any) => {
    // add the schema id to flat[] (its a String8 with 5 characters, the first char is #)
    if (schema?._id) flat.push({ d: schema._id, t: "String8" })
    else if (schema?.[0]?._id) flat.push({ d: schema[0]._id, t: "String8" })

    // if it is a schema
    if (schema?._struct) schema = schema._struct
    // if it is a schema[]
    else if (schema?.[0]?._struct) schema = schema[0]._struct

    for (const property in data) {
      if (typeof data[property] === "object") {
        // if data is array, but schemas is flat, use index 0 on the next iteration
        if (Array.isArray(data)) flatten(schema, data[parseInt(property)])
        else flatten(schema[property], data[property])
      } else {
        // handle special types e.g.:  "x: { type: int16, digits: 2 }"
        if (schema[property]?.type?._type) {
          if (schema[property]?.digits) {
            data[property] *= Math.pow(10, schema[property].digits)
            data[property] = parseInt(data[property].toFixed(0))
          }
          if (schema[property]?.length) {
            const length = schema[property]?.length
            data[property] = cropString(data[property], length)
          }
          flat.push({ d: data[property], t: schema[property].type._type })
        } else {
          // crop strings to default lenght of 12 characters if nothing else is specified
          if (schema[property]._type === "String8" || schema[property]._type === "String16") {
            data[property] = cropString(data[property], 12)
          }
          flat.push({ d: data[property], t: schema[property]._type })
        }
      }
    }
  }

  flatten(schema, data)

  return flat
}
