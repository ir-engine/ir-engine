import { createType } from "ecsy"
export const CustomTypes = {}

export const FunctionType = createType({
  baseType: Function,
  isSimpleType: true,
  create: defaultValue => {
    return typeof defaultValue === "function" ? defaultValue : undefined
  },
  reset: (src, key, defaultValue) => {
    src[key] = typeof defaultValue === "function" ? defaultValue : undefined
  },
  clear: (src, key) => {
    src[key] = undefined
  }
})
