import { createType } from "ecsy"

export const RGB = createType({
  baseType: Array,
  create: defaultValue => {
    return typeof defaultValue === "object" ? { ...defaultValue } : { r: 1, g: 1, b: 1 }
  },
  reset: (src, key, defaultValue) => {
    src[key] = typeof defaultValue === "object" ? defaultValue : { r: 1, g: 1, b: 1 }
  },
  clear: (src, key) => {
    src[key] = { r: 1, g: 1, b: 1 }
  },
  copy: (src, dst, key) => {
    src[key].r = dst[key].r
    src[key].g = dst[key].g
    src[key].b = dst[key].b
  }
})
