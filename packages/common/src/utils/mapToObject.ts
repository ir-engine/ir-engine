import { cloneDeep, merge } from 'lodash'

export const mapToObject = <K extends string | number, V>(map: Map<K, V>): Record<K, V> =>
  Array.from(map.entries()).reduce((obj, [key, value]) => {
    return merge({ [key]: value }, obj)
  }, {}) as any

export const iterativeMapToObject = (root: Record<any, any>) => {
  const seen = new Set()
  const iterate = (obj) => {
    if (typeof obj !== 'object' || obj === null) return obj
    const output = {}
    for (const [key, value] of Object.entries(obj)) {
      if (seen.has(value)) continue
      if (typeof value === 'object') seen.add(value)
      if (!value) {
        output[key] = value
      } else if (value instanceof Map && value) {
        output[key] = mapToObject(value)
      } else if (Array.isArray(value)) {
        output[key] = [...value.map((val) => iterate(val))]
      } else {
        output[key] = iterate(value)
      }
    }
    return output
  }
  return cloneDeep(iterate(root))
}
