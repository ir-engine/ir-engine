export function GetBytes(int) {
  var b: any = []
  b[0] = int
  b[1] = int >> 8
  b[2] = int >> 16
  b[3] = int >> 24
  return b
}
export function ToInt(buffer, index) {
  return (buffer[index] | (buffer[index + 1] << 8) | (buffer[index + 2] << 16) | (buffer[index + 3] << 24)) >>> 0
}

const encodingBuffer = new ArrayBuffer(4)
const farr = new Float32Array(encodingBuffer)
const barr = new Int8Array(encodingBuffer)
export function encodeFloat(float) {
  farr[0] = float
  return [...barr]
}

export function decodeFloat(byteArray) {
  barr.set(byteArray)
  return farr[0]
}
