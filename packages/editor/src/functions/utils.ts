export function insertSeparator(children, separatorFn) {
  if (!Array.isArray(children)) {
    return children
  }
  const length = children.length
  if (length === 1) {
    return children[0]
  }
  return children.reduce((acc, item, index) => {
    acc.push(item)
    if (index !== length - 1) {
      acc.push(separatorFn(index))
    }
    return acc
  }, [])
}
export function objectToMap(object: object) {
  return new Map(Object.entries(object))
}

export const unique = <T, S = T>(arr: T[], keyFinder: (item: T) => S): T[] => {
  const set = new Set<S>()
  const newArr = [] as T[]
  if (!keyFinder) keyFinder = (item: T) => item as any as S

  for (const item of arr) {
    const key = keyFinder(item)
    if (set.has(key)) continue

    newArr.push(item)
    set.add(key)
  }

  return newArr
}

export const isApple = () => {
  const iOS_1to12 = /iPad|iPhone|iPod/.test(navigator.platform)

  const iOS13_iPad = navigator.platform === 'MacIntel'

  const iOS1to12quirk = () => {
    var audio = new Audio() // temporary Audio object
    audio.volume = 0.5 // has no effect on iOS <= 12
    return audio.volume === 1
  }

  return iOS_1to12 || iOS13_iPad || iOS1to12quirk()
}

export const cmdOrCtrlString = isApple() ? '⌘' : 'ctrl'

export function getStepSize(event, smallStep, mediumStep, largeStep) {
  if (event.altKey) {
    return smallStep
  } else if (event.shiftKey) {
    return largeStep
  }
  return mediumStep
}

export function toPrecision(value, precision) {
  const p = 1 / precision
  return Math.round(value * p) / p
}
// https://stackoverflow.com/a/26188910
export function camelPad(str) {
  return str
    .replace(/([A-Z]+)([A-Z][a-z])/g, ' $1 $2')
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])(\d)/g, '$1 $2')
    .replace(/^./, (str) => {
      return str.toUpperCase()
    })
    .trim()
}
// https://stackoverflow.com/a/18650828
export function bytesToSize(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes == 0) return '0 Byte'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i]
}
