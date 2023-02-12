const byteToHex = new Array(0xff)

for (let n = 0; n <= 0xff; ++n) {
  const hexOctet = n.toString(16).padStart(2, '0')
  byteToHex[n] = hexOctet
}

export function byteArrayToHex(byteArray: Uint8Array) {
  const l = byteArray.length
  let hex = ''
  for (let i = 0; i < l; ++i) hex += byteToHex[byteArray[i]]
  return hex
}

export function bufferToHex(arrayBuffer: ArrayBuffer) {
  return byteArrayToHex(new Uint8Array(arrayBuffer))
}
