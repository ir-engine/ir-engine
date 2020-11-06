function isNode() { return typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node !== 'undefined'; }
export const isClient = !isNode();