import { createType } from "ecsy"

export const VecXYZ = createType({
  baseType: Object,
  create: defaultValue => {
    return typeof defaultValue === "object" ? { ...defaultValue } : { x: 0, y: 0, z: 0 }
  },
  reset: (src, key, defaultValue) => {
    src[key] = typeof defaultValue === "object" ? defaultValue : { x: 0, y: 0, z: 0 }
  },
  clear: (src, key) => {
    src[key] = { x: 0, y: 0, z: 0 }
  },
  copy: (src, dst, key) => {
    src[key].x = dst[key].x
    src[key].y = dst[key].y
    src[key].z = dst[key].z
  }
})
