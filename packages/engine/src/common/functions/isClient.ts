/** @returns Whether system is client or not. */
function isNode() { return typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node !== 'undefined'; }
export const isClient = !isNode();