/** Indicates whether the system is client or not. */
export const isClient =
  typeof process !== 'object' || typeof process.versions !== 'object' || typeof process.versions.node === 'undefined'
