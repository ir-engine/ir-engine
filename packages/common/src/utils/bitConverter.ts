export function GetBytes(int) {
  var b = []
  b[0] = int
  b[1] = int >> 8
  b[2] = int >> 16
  b[3] = int >> 24
  return b
}
export function ToInt(buffer, index) {
  return (buffer[index] | (buffer[index + 1] << 8) | (buffer[index + 2] << 16) | (buffer[index + 3] << 24)) >>> 0
}

export function encodeFloat(float) {
  const farr = new Float32Array(1)
  farr[0] = float
  const barr = new Int8Array(farr.buffer)
  return [...barr]
}

export function decodeFloat(byteArray) {
  const barr = new Int8Array(byteArray.length)
  barr.set(byteArray)
  return new Float32Array(barr.buffer)[0]
}
