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
export function unique(arr, maybeComp) {
  const set = new Set()
  const newArr = []
  let comp = maybeComp
  if (typeof comp === 'undefined') {
    comp = (item) => item
  } else if (typeof comp === 'string') {
    comp = (item) => item[maybeComp]
  }
  for (const item of arr) {
    const key = comp(item)
    if (set.has(key)) continue
    newArr.push(item)
    set.add(key)
  }
  return newArr
}
export const isApple = /(Mac|iPhone|iPod|iPad)/i.test((process as any).browser && navigator ? navigator.platform : '')
export const cmdOrCtrlString = isApple ? '⌘' : 'ctrl'
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
