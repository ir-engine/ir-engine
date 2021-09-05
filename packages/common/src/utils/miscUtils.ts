export function wait(ms: number): void {
  const date = Date.now()
  let currentDate = null
  do {
    currentDate = Date.now()
  } while (currentDate - date < ms)
}
export function waitS(seconds: number): void {
  wait(seconds * 1000)
}

export function isNumber(value: string | number): boolean {
  return value != null && value !== '' && !isNaN(Number(value.toString()))
}
