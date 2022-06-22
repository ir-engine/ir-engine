import { Texture } from 'three'

export function extractDefaults(defaultArgs) {
  return formatMaterialArgs(
    Object.fromEntries(Object.entries(defaultArgs).map(([k, v]: [string, any]) => [k, v.default]))
  )
}

export function formatMaterialArgs(args) {
  if (!args) return args
  return Object.fromEntries(
    Object.entries(args).map(([k, v]) => {
      const tex = v as Texture
      if (tex?.isTexture) {
        if (tex.source.data != undefined) {
          return [k, v]
        }
        return [k, undefined]
      }
      if (v === '') return [k, undefined]
      return [k, v]
    })
  )
}
