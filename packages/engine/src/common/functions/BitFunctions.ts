export function getBit(number, bitPosition) {
  return (number & (1 << bitPosition)) === 0 ? 0 : 1
}

export function setBit(number, bitPosition) {
  return number | (1 << bitPosition)
}

export function clearBit(number, bitPosition) {
  const mask = ~(1 << bitPosition)
  return number & mask
}

export function updateBit(number, bitPosition, bitValue) {
  const bitValueNormalized = bitValue ? 1 : 0
  const clearMask = ~(1 << bitPosition)
  return (number & clearMask) | (bitValueNormalized << bitPosition)
}
