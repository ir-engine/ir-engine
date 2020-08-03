import { createType } from "ecsy"

export const VecXY = createType({
  baseType: Object,
  create: defaultValue => {
    return typeof defaultValue === "object" ? { ...defaultValue } : { x: 0, y: 0 }
  },
  reset: (src, key, defaultValue) => {
    src[key] = typeof defaultValue === "object" ? defaultValue : { x: 0, y: 0 }
  },
  clear: (src, key) => {
    src[key] = { x: 0, y: 0 }
  },
  copy: (src, dst, key) => {
    src[key].x = dst[key].x
    src[key].y = dst[key].y
  }
})
