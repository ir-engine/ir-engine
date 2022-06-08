import { Texture } from 'three'

export function formatMaterialArgs(args) {
  if (!args) return args
  let _args = Object.entries(args)
    .map(([k, v]) => {
      const tex = v as Texture
      if (tex.isTexture) {
        if (tex.source.data !== undefined) {
          return [k, v]
        }
        return [k, null]
      }
      if (v === '') return [k, null]
      return [k, v]
    })
    .filter(([k, v]) => v !== null)
  _args = Object.fromEntries(_args)
  return _args
}
