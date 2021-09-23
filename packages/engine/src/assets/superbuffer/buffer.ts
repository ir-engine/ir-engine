import { uint8 } from './views'
import type { BufferView, Serializable } from './types'

// setBigUint64/getBigUint64 polfyill needed for some browsers

DataView.prototype.setBigUint64 ??= function (byteOffset, value, littleEndian) {
  const wh = Number((value >> 32n) & 0xffffffffn)
  const wl = Number(value & 0xffffffffn)
  const [h, l] = littleEndian ? [4, 0] : [0, 4]
  this.setUint32(byteOffset + h, wh, littleEndian)
  this.setUint32(byteOffset + l, wl, littleEndian)
}

DataView.prototype.getBigUint64 ??= function (byteOffset, littleEndian) {
  const [h, l] = littleEndian ? [4, 0] : [0, 4]
  const wh = BigInt(this.getUint32(byteOffset + h, littleEndian))
  const wl = BigInt(this.getUint32(byteOffset + l, littleEndian))
  return (wh << 32n) + wl
}

/**
 * The BufferManager class provides an API for reading and writing to an ArrayBuffer via
 * DataViews while tracking the current byte offset and automatically handling string encoding.
 */
export class BufferManager {
  /**
   * Max buffer size for a serialized object. Default: 1 megabyte.
   */
  public readonly maxByteSize: number
  /**
   * Internal ArrayBuffer reference.
   */
  protected _buffer: ArrayBuffer
  /**
   * Internal DataView reference.
   */
  protected _dataView: DataView
  /**
   * Current byte position in the DataView.
   */
  protected _offset: number
  /**
   * Internal TextEncoder reference.
   */
  protected _textEncoder: TextEncoder
  /**
   * Internal TextDecoder reference.
   */
  protected _textDecoder: TextDecoder
  /**
   * Internal Uint8Array representation of the DataView.
   */
  protected _uint8Array: Uint8Array
  /**
   * Get the current byte offset of the buffer.
   */
  public get offset(): number {
    return this._offset
  }

  /**
   * Create a new BufferManager instance.
   * @param bufferSize The maximum size of the internal ArrayBuffer.
   */
  public constructor(bufferSize?: number) {
    this.maxByteSize = bufferSize ?? 1e6
    this._offset = 0
    this._buffer = new ArrayBuffer(this.maxByteSize)
    this._dataView = new DataView(this._buffer)
    this._uint8Array = new Uint8Array(this._buffer)
    this._textEncoder = new TextEncoder()
    this._textDecoder = new TextDecoder()
  }

  /**
   * Refresh this Model's internal buffer and DataView before toBuffer is called.
   * @param newBuffer Specific ArrayBuffer instance, otherwise a default will be used.
   */
  public refresh(newBuffer?: ArrayBuffer): void {
    this._offset = 0
    if (newBuffer) {
      this._uint8Array.set(new Uint8Array(newBuffer))
    }
  }

  /**
   * Copy the contents of the internal ArrayBuffer (which may contain trailing empty sections)
   * into a new ArrayBuffer with no empty bytes.
   */
  public finalize(): ArrayBuffer {
    return this._buffer.slice(0, this._offset)
  }

  /**
   * Append data to the internal DataView buffer.
   * @param bufferView BufferView to define the type appended.
   * @param data Data to be appended to the DataView.
   */
  public append(bufferView: BufferView, data: Serializable): void {
    if (bufferView.type === 'String') {
      this._dataView.setUint8(this._offset, 34) // Wrap in double quotes
      this._offset += uint8.bytes
      const encoded = this._textEncoder.encode(data.toString())
      this._uint8Array.set(encoded, this._offset)
      this._offset += encoded.byteLength
      this._dataView.setUint8(this._offset, 34) // Wrap in double quotes
      this._offset += uint8.bytes
      return
    }
    if (bufferView.type === 'Boolean') {
      this._dataView.setUint8(this._offset, data === true ? 1 : 0)
    } else {
      switch (bufferView.type) {
        case 'BigInt64':
        case 'BigUint64': {
          data = typeof data === 'bigint' ? data : BigInt(data)
          break
        }
        case 'Float32':
        case 'Float64': {
          data = Number(Number(data).toPrecision(bufferView.type === 'Float32' ? 7 : 16))
          break
        }
      }
      this._dataView[`set${bufferView.type}` as const](this._offset, data as never)
    }
    this._offset += bufferView.bytes
  }

  /**
   * Read the DataView at the current byte offset according to the BufferView type, and
   * increment the offset if the read was successful.
   * @param bufferView BufferView to define the type read.
   */
  public read(bufferView: BufferView): Serializable
  public read(bufferView: BufferView<string>): string
  public read(bufferView: BufferView<number>): number
  public read(bufferView: BufferView<bigint>): bigint
  public read(bufferView: BufferView): Serializable {
    let result: Serializable
    let newOffset = this._offset + bufferView.bytes
    // String
    if (bufferView.type === 'String') {
      const startingDoubleQuote = this._uint8Array[this._offset] // Char code of " is 34
      const endQuoteIndex = this._uint8Array.indexOf(34, this._offset + 1)
      if (startingDoubleQuote !== 34 || endQuoteIndex < this._offset) {
        throw new Error('Buffer contains invalid string.')
      }
      result = this._textDecoder.decode(this._uint8Array.subarray(this._offset + 1, endQuoteIndex))
      newOffset = endQuoteIndex + 1
    }
    // Boolean
    else if (bufferView.type === 'Boolean') {
      result = Boolean(this._dataView.getUint8(this._offset))
    }
    // Number
    else {
      result = this._dataView[`get${bufferView.type}` as const](this._offset)
      if (bufferView.type === 'Float32' || bufferView.type === 'Float64') {
        result = Number(Number(result).toPrecision(bufferView.type === 'Float32' ? 7 : 16))
      }
    }
    this._offset = newOffset
    return result
  }
}
