import type { BufferView } from './types'

// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays

/**
 * Creates a schema representation for a signed integer value.
 * @param type Bit length of the integer.
 */
const int = (type: 8 | 16 | 32): BufferView<number> => ({
  type: `Int${type}` as const,
  bytes: type === 8 ? 1 : type === 16 ? 2 : 4
})

/**
 * `int8`: [-128, 127] (1 byte)
 */
export const int8 = int(8)

/**
 * `int16`: [-32768, 32767] (2 bytes)
 */
export const int16 = int(16)

/**
 * `int32`: [-2147483648, 2147483647] (4 bytes)
 */
export const int32 = int(32)

/**
 * Creates a schema representation for an unsigned integer value.
 * @param type Bit length of the integer.
 */
const uint = (type: 8 | 16 | 32): BufferView<number> => ({
  type: `Uint${type}` as const,
  bytes: type === 8 ? 1 : type === 16 ? 2 : 4
})

/**
 * `uint8`: [0, 255] (1 byte)
 */
export const uint8 = uint(8)

/**
 * `uint16`: [0, 65535] (2 bytes)
 */
export const uint16 = uint(16)

/**
 * `uint32`: [0, 4294967295] (4 bytes)
 */
export const uint32 = uint(32)

/**
 * Creates a schema representation for a BigInteger value.
 * @param signed Control whether the bigint is signed or unsigned.
 */
const bigint = (signed: boolean): BufferView<bigint> => ({
  type: `Big${signed ? 'Int' : 'Uint'}64` as const,
  bytes: 8
})

/**
 * `int64`: [-2^63, 2^63-1] (8 bytes)
 */
export const int64 = bigint(true)

/**
 * `uint64`: [0, 2^64-1] (8 bytes)
 */
export const uint64 = bigint(false)

/**
 * Creates a schema representation for a floating-point value.
 * @param type Bit length of the float.
 */
const float = (type: 32 | 64): BufferView<number> => ({
  type: `Float${type}` as const,
  bytes: type === 32 ? 4 : 8
})

/**
 * `float32`: [1.2×10-38, 3.4×1038] (7 significant digits) (4 bytes)
 */
export const float32 = float(32)

/**
 * `float64`: [5.0×10-324, 1.8×10308] (16 significant digits) (8 bytes)
 */
export const float64 = float(64)

/**
 * `string`: UTF-8 encoding (variable byte length of Uint8Array)
 */
export const string: BufferView<string> = {
  type: 'String' as const,
  bytes: 1
}

/**
 * `boolean`: True (1) and false (0) (1 byte)
 */
export const boolean: BufferView<boolean> = {
  type: 'Boolean' as const,
  bytes: 1
}
