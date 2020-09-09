/** -128 to 127 (1 byte) */
export const int8 = { type: 'Int8Array', bytes: 1 };
/** 0 to 255 (1 byte) */
export const uint8 = { type: 'Uint8Array', bytes: 1 };

/** -32768 to 32767 (2 bytes) */
export const int16 = { type: 'Int16Array', bytes: 2 };
/** 0 to 65535 (2 bytes) */
export const uint16 = { type: 'Uint16Array', bytes: 2 };

/** -2147483648 to 2147483647 (4 bytes) */
export const int32 = { type: 'Int32Array', bytes: 4 };
/** 0 to 4294967295 (4 bytes) */
export const uint32 = { type: 'Uint32Array', bytes: 4 };

/** -2^63 to 2^63-1 (8 bytes) */
export const int64 = { type: 'BigInt64Array', bytes: 8 };
/** 0 to 2^64-1 (8 bytes) */
export const uint64 = { type: 'BigUint64Array', bytes: 8 };

/** 1.2×10-38 to 3.4×1038 (7 significant digits e.g., 1.123456) (4 bytes) */
export const float32 = { type: 'Float32Array', bytes: 4 };

/** 5.0×10-324 to 1.8×10308 (16 significant digits e.g., 1.123...15) (8 bytes) */
export const float64 = { type: 'Float64Array', bytes: 8 };

/** 1 byte per character */
export const string8 = { type: 'String8', bytes: 1 };
/** 2 bytes per character */
export const string16 = { type: 'String16', bytes: 2 };
