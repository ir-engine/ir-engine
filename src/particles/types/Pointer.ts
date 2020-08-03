import { createType } from "ecsy"

export const Pointer = createType({
  baseType: Object,
  create: defaultValue => {
    return typeof defaultValue === "object" ? defaultValue : undefined
  },
  reset: (src, key, defaultValue) => {
    src[key] = typeof defaultValue === "object" ? defaultValue : undefined
  },
  clear: (src, key) => {
    src[key] = undefined
  },
  copy: (src, dst, key) => {
    src[key] = dst[key]
  }
})
