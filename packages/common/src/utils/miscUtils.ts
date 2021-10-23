export function wait(ms: number): void {
  const date = Date.now()
  let currentDate: any = null!
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

export function combine(first, second, third) {
  const res: any[] = []

  for (let i = 0; i < first.length; i++) res.push(first[i])
  for (let i = 0; i < second.length; i++) res.push(second[i])
  for (let i = 0; i < third.length; i++) res.push(third[i])

  return res
}
export function combineArrays(arrays: [[]]) {
  const res = []

  for (let i = 0; i < arrays.length; i++) {
    for (let j = 0; j < arrays[i].length; j++) {
      res.push(arrays[i][j])
    }
  }

  return res
}

export function arraysAreEqual(arr1: any[], arr2: any[]): boolean {
  if (arr1.length !== arr2.length) return false

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false
    }
  }

  return true
}
